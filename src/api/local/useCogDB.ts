import { createContext, useEffect, useRef, useState } from 'react'
import { Setter, TaskStatus } from '../../types'
import { cogDB, isScryfallManifest, Manifest } from './db'
import { migrateCubes, putFile } from './populate'
import { NormedCard } from '../memory/types/normedCard'
import { QueryReport, useReporter } from '../useReporter'
import { ImportTarget } from '../../ui/data/cardDataView'

export const DB_INIT_MESSAGES = [
  "loading card manifest...",
  "downloading card data...",
  "loading cubes...",
  "downloading oracle tags...",
  "preparing card entries...",
  "loading cards to memory...",
  "persisting cards to database. search is ready, but don't leave the page or make data changes",
  "persisting oracle tags to database. search is ready, but don't leave the page or make data changes",
]
export interface CogDB {
  dbStatus: TaskStatus
  memStatus: TaskStatus
  dbReport: QueryReport
  memory: NormedCard[]
  setMemory: Setter<NormedCard[]>
  manifest: Manifest
  outOfDate: boolean
  setManifest: Setter<Manifest>
  saveToDB: (manifest?: Manifest, cards?: NormedCard[]) => Promise<void>
  resetDB: () => Promise<void>
  refreshDB: () => Promise<void>
  loadManifest: (manifest: Manifest, targets: ImportTarget[]) => Promise<void>
}

const defaultDB: CogDB = {
  dbStatus: 'unstarted',
  memStatus: 'unstarted',
  memory: [],
  dbReport: null,
  setMemory: () => console.error("CogDB.setMemory called without a provider!"),
  manifest: {
    id: '',
    name: '',
    type: '',
    lastUpdated: new Date(),
  },
  setManifest: () => console.error("CogDB.setManifest called without a provider!"),
  saveToDB: () => Promise.reject("CogDB.saveToDB called without a provider!"),
  resetDB: () => Promise.reject("CogDB.resetDB called without a provider!"),
  refreshDB: () => Promise.reject("CogDB.refreshDB called without a provider!"),
  loadManifest: () => Promise.reject("CogDB.loadManifest called without a provider!"),
  outOfDate: false,
}

const EPOCH = new Date(1970, 1, 1)

export const CogDBContext = createContext(defaultDB)

export const useCogDB = (): CogDB => {
  const dbReport = useReporter()
  const [dbStatus, setDbStatus] = useState<TaskStatus>('unstarted')
  const [memStatus, setMemStatus] = useState<TaskStatus>('loading')
  const [memory, setMemory] = useState<NormedCard[]>([])
  const [manifest, setManifest] = useState<Manifest>({
    id: 'loading',
    name: 'loading',
    type: 'loading',
    lastUpdated: new Date(),
  })

  const rezzy = useRef<NormedCard[]>([])
  const handleLoadDB = (event: MessageEvent): any => {
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
        if (index % 1000 === 0)
          dbReport.addCardCount(1000)
        break
      case 'manifest':
        setManifest(data)
        break
      case 'end':
        setMemory(rezzy.current)
        setMemStatus('success')
        setDbStatus('success')
        console.timeEnd(`loading mem`)
        dbReport.markTimepoint('end')
        break
      case 'error':
        console.error('waaaaaa', data)
        break
      default:
        console.error('unknown message from db worker')
        break
    }
  }

  const saveToDB = async (manifestOverride?: Manifest, cards?: NormedCard[]) => {
    setDbStatus('loading')
    try {
      await putFile(manifestOverride ?? manifest, cards ?? memory)
      setDbStatus('success')
    } catch (e) {
      console.error(e)
      setDbStatus('error')
    }
  }
  const handleInitDB = (event: MessageEvent): any => {
    const {type, data} = event.data
    switch (type) {
      case 'manifest':
        const { manifest, shouldSetManifest } = data
        dbReport.addComplete()
        if (shouldSetManifest) {
          setManifest(manifest)
        }
        break
      case "downloaded-cards":
      case "loaded-cubes":
      case "downloaded-otags":
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
        setMemory(rezzy.current)
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
        break
      default:
        console.error('unknown message from db worker')
        break
    }
  }

  const loadDB = async () => {
    console.debug("starting worker")
    // @ts-ignore
    const worker = new Worker(new URL("./dbWorker.ts", import.meta.url))
    rezzy.current = []
    dbReport.reset(DB_INIT_MESSAGES.length)
    setMemStatus('loading')
    console.time(`loading mem`)

    const cardManifest = await cogDB.collection.get("the_one")
    if (cardManifest === undefined) {
      console.debug('initializing db')
      setDbStatus('loading')
      worker.onmessage = handleInitDB
      worker.postMessage({
        type: 'init',
        data: {
          bulkType: 'default_cards',
          targets: ['memory', 'db']
        }
      })
    } else {
      console.debug("posting start message to worker")
      worker.onmessage = handleLoadDB
      worker.postMessage({ type: 'load' })
    }

  }

  const resetDB = async () => {
    try {
      console.time("migrated cubes")
      await migrateCubes()
      console.timeEnd("migrated cubes")
      await loadDB()
    } catch (e) {
      console.error(e)
      setMemStatus('error')
    }
  }

  const loadManifest = async (manifest: Manifest, targets: ImportTarget[]) => {
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
    worker.postMessage({ type: 'init', data: { bulkType: manifest.type, targets } })
  }

  const refreshDB = async () => {
    await loadManifest(manifest, ['memory', 'db'])
  }

  useEffect(() => { resetDB() }, [])

  return {
    dbStatus,
    saveToDB,
    memStatus,
    manifest,
    setManifest,
    memory,
    setMemory,
    resetDB,
    refreshDB,
    loadManifest,
    dbReport,
    outOfDate: (manifest?.lastUpdated ?? EPOCH) < cogDB.LAST_UPDATE
  }
}
