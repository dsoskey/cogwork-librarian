import { createContext, useCallback, useMemo, useRef, useState } from 'react'
import { Setter, TaskStatus } from '../../types'
import { cogDB, isScryfallManifest, Manifest } from './db'
import { migrateCubes, putFile } from './populate'
import { NormedCard, SearchError } from 'mtgql'
import { QueryReport, useReporter } from '../useReporter'
import { useLocalStorage } from './useLocalStorage'
import { displayMessage } from '../../error'
import { CARD_INDEX } from './cardIndex'

export const DB_LOAD_MESSAGES = [
  "loading cubes",
  "loading oracle tags",
  "loading illustration tags",
  "preparing the library",
]

export const DB_INIT_MESSAGES = [
  "loading card manifest",
  "downloading card data",
  "downloading oracle tags",
  "preparing oracle tags",
  "downloading illustration tags",
  "preparing illustration tags",
  "downloading set data",
  "preparing set data",
  "preparing card entries",
  "loading cards to memory",
  "persisting cards to database. search is ready, but don't leave the page or make data changes",
]

export type ImportTarget = 'memory' | 'db'

export interface CogDB {
  dbStatus: TaskStatus
  dbError: string
  memStatus: TaskStatus
  memError: string
  dbReport: QueryReport
  memory: NormedCard[]
  setMemory: Setter<NormedCard[]>
  loadFilter: string
  setLoadFilter: Setter<string>
  manifest: Manifest
  outOfDate: boolean
  setManifest: Setter<Manifest>
  saveToDB: (manifest?: Manifest, cards?: NormedCard[]) => Promise<void>
  resetDB: () => Promise<void>
  loadManifest: (manifest: Manifest, targets: ImportTarget[], filter: string) => Promise<void>
  loadMtgJSONDB: (targets: ImportTarget[], filter: string) => Promise<void>
}

const defaultDB: CogDB = {
  dbStatus: 'unstarted',
  dbError: "",
  memStatus: 'unstarted',
  memError: "",
  memory: [],
  dbReport: null,
  setMemory: () => console.error("CogDB.setMemory called without a provider!"),
  manifest: {
    id: '',
    name: '',
    type: '',
    lastUpdated: new Date(),
    filter: '',
  },
  setManifest: () => console.error("CogDB.setManifest called without a provider!"),
  loadFilter: "",
  setLoadFilter: () => console.error("CogDB.setLoadFilter called without a provider!"),
  saveToDB: () => Promise.reject("CogDB.saveToDB called without a provider!"),
  resetDB: () => Promise.reject("CogDB.resetDB called without a provider!"),
  loadManifest: () => Promise.reject("CogDB.loadManifest called without a provider!"),
  loadMtgJSONDB: () => Promise.reject("CogDB.loadMtgJSONDB called without a provider!"),
  outOfDate: false,
}

const EPOCH = new Date(1970, 1, 1)

export const CogDBContext = createContext(defaultDB)



export const useCogDB = (): CogDB => {
  const dbReport = useReporter()
  const [dbStatus, setDbStatus] = useState<TaskStatus>('unstarted')
  const [dbError, setDbError] = useState<string>('')
  const [memStatus, setMemStatus] = useState<TaskStatus>('loading')
  const [memError, setMemError] = useState<string>('')

  const [memory, rawSetMemory] = useState<NormedCard[]>([])
  const rezzy = useRef<NormedCard[]>([])

  const setMemory = useCallback((next: NormedCard[]) => {
    rawSetMemory(next)
    CARD_INDEX.reset()
    for (let i = 0; i < next.length; i++){
      const card = next[i];
      CARD_INDEX.addCard(card);
    }
  }, [memory, rawSetMemory])

  const [loadFilter, setLoadFilter] = useLocalStorage<string>("load-filter", "")
  const [manifest, setManifest] = useState<Manifest>({
    id: 'loading',
    name: 'loading',
    type: 'loading',
    lastUpdated: new Date(),
    filter: "",
  })

  const handleLoadDB = useCallback((event: MessageEvent): any => {
    const {type, data} = event.data
    switch (type) {
      case 'count':
        const value = data as number
        console.debug(`received card count ${value}`)
        dbReport.setTotalCards(value)
        break
      case 'card':
        const { card, index } = data
        rezzy.current.push(card)
        CARD_INDEX.addCard(card)
        if (index % 1000 === 0)
          dbReport.addCardCount(1000)
        else if (index === dbReport.totalCards - 1) {
          dbReport.addCardCount(index % 1000)
        }
        break
      case 'manifest':
        setManifest(data)
        break
      case 'end':
        rawSetMemory(rezzy.current)
        setMemStatus('success')
        setDbStatus('success')
        console.timeEnd(`loading mem`)
        dbReport.markTimepoint('end')
        break
      case 'error':
        console.error('waaaaaa', data)
        break
      case 'filter-error':
        const error = data as SearchError;
        const nextMemError = `In-memory database load failed due to invalid search query.\n${displayMessage(error, 0)}`;
        setMemError(nextMemError);
        setMemStatus(prev => prev === 'loading' ? 'error' : prev)
        setDbStatus(prev => prev === 'loading' ? 'error' : prev)
        break
      default:
        console.error(`unknown message [${type}] from db worker`)
        break
    }
  }, [dbReport, rawSetMemory, setManifest, setMemStatus, setDbStatus]);

  const saveToDB = useCallback(async (manifestOverride?: Manifest, cards?: NormedCard[]) => {
    setDbStatus('loading')
    try {
      await putFile(manifestOverride ?? manifest, cards ?? memory)
      setDbStatus('success')
    } catch (e) {
      console.error(e)
      setDbStatus('error')
    }
  }, [setDbStatus]);

  const handleInitDB = useCallback((event: MessageEvent): any => {
    const {type, data} = event.data
    switch (type) {
      case 'manifest':
        dbReport.addComplete()
        if (data.shouldSetManifest) {
          setManifest(data.manifest)
        }
        break
      case "downloaded-cards":
      case "loaded-cubes":
      case "oracle-tag-downloaded":
      case "oracle-tag-end":
      case "illustration-tag-downloaded":
      case "illustration-tag-end":
      case "sets-downloaded":
      case "sets-end":
        dbReport.addComplete()
        break
      case "normed-cards":
        dbReport.addComplete()
        dbReport.setTotalCards(data)
        break
      case 'card':
        const { card, index } = data
        rezzy.current.push(card)
        if (index % 1000 === 0)
          dbReport.addCardCount(1000)
        break
      case 'memory-end':
        rawSetMemory(rezzy.current)
        setMemStatus('success')
        console.timeEnd(`loading mem`)
        dbReport.addComplete()
        break
      case "saved-cards":
        dbReport.addComplete()
        break
      case 'db-end':
        setDbStatus('success')
        dbReport.addComplete()
        dbReport.markTimepoint('end')
        break
      case 'error':
        console.error('waaaaaa', data)
        setMemStatus(prev => prev === 'loading' ? 'error' : prev)
        setDbStatus(prev => prev === 'loading' ? 'error' : prev)
        break;
      case 'filter-error':
        const error = data as SearchError;
        const nextDbError = `Database import failed due to invalid search query.\n${displayMessage(error, 0)}`;
        setDbError(nextDbError);
        setMemStatus(prev => prev === 'loading' ? 'error' : prev)
        setDbStatus(prev => prev === 'loading' ? 'error' : prev)
        break
      default:
        console.error(`unknown message [${type}] from db worker`)
        break
    }
  }, [dbReport, rawSetMemory, setMemStatus, setDbStatus]);

  const loadDB = useCallback(async () => {
    console.debug("starting worker")
    // @ts-ignore
    const worker = new Worker(new URL("./dbWorker.ts", import.meta.url))
    rezzy.current = []
    setMemStatus('loading')
    setMemError("")
    setDbError("")
    console.time(`loading mem`)

    const cardManifest = await cogDB.collection.get("the_one")
    if (cardManifest === undefined) {
      console.debug('initializing db')
      dbReport.reset(DB_INIT_MESSAGES.length)
      setDbStatus('loading')
      worker.onmessage = handleInitDB
      worker.postMessage({
        type: 'init',
        data: {
          bulkType: 'default_cards',
          targets: ['memory', 'db'],
        }
      })
    } else {
      setDbStatus("success")
      console.debug("posting start message to worker")
      worker.onmessage = handleLoadDB
      worker.postMessage({ type: 'load', data: { filter: loadFilter } })
    }
  }, [setMemStatus, setMemError, setDbStatus, handleLoadDB]);

  const resetDB = useCallback(async () => {
    try {
      console.time("migrated cubes")
      await migrateCubes()
      console.timeEnd("migrated cubes")
      await loadDB()
    } catch (e) {
      console.error(e)
      setMemStatus('error')
    }
  }, [loadDB, setMemStatus]);

  const loadManifest = useCallback(async (manifest: Manifest, targets: ImportTarget[], filter: string) => {
    if (!isScryfallManifest(manifest.type)) {
      throw Error("don't try to refresh the db with a non-scryfall manifest")
    }
    console.debug("starting worker")
    // @ts-ignore
    const worker = new Worker(new URL("./dbWorker.ts", import.meta.url))
    if (targets.find(it => it === 'memory')) {
      rezzy.current = []
    }
    dbReport.reset(DB_INIT_MESSAGES.length)
    setMemStatus('loading')
    setDbStatus("loading")
    console.time(`loading mem`)

    console.debug('refreshing db')
    worker.onmessage = handleInitDB
    worker.postMessage({ type: 'init', data: { bulkType: manifest.type, targets, filter } })
  }, [setMemStatus, setDbStatus, handleInitDB, dbReport])

  const loadMtgJSONDB = useCallback(async (targets: ImportTarget[], filter: string) => {
    console.debug("starting worker")
    // @ts-ignore
    const worker = new Worker(new URL("./dbWorker.ts", import.meta.url))
    if (targets.find(it => it === 'memory')) {
      rezzy.current = []
    }
    dbReport.reset(DB_INIT_MESSAGES.length)
    setMemStatus('loading')
    setDbStatus("loading")
    console.time(`loading mem`)

    console.debug('refreshing db')
    worker.onmessage = handleInitDB
    worker.postMessage({ type: 'init', data: { bulkType: "mtgjson", targets, filter } })

  }, [dbReport, handleInitDB, setMemStatus, setDbStatus]);

  const outOfDate = useMemo(() => (manifest?.lastUpdated ?? EPOCH) < cogDB.LAST_UPDATE, [manifest])
  return {
    dbStatus,
    dbError,
    saveToDB,
    memStatus,
    memError,
    manifest,
    setManifest,
    memory,
    setMemory,
    resetDB,
    loadManifest,
    loadMtgJSONDB,
    dbReport,
    outOfDate,
    loadFilter,
    setLoadFilter
  }
}