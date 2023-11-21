import { createContext, SetStateAction, useEffect, useRef, useState } from 'react'
import { Setter, TaskStatus } from '../../types'
import { cogDB, isScryfallManifest, Manifest } from './db'
import { migrateCubes, putFile } from './populate'
import { NormedCard } from '../memory/types/normedCard'
import { QueryReport, useReporter } from '../useReporter'
import { ImportTarget } from '../../ui/data/cardDataView'
import { isFunction } from 'lodash'
import { isOracleVal } from '../memory/filters/is'

export const DB_LOAD_MESSAGES = [
  "loading cubes...",
  "loading oracle tags...",
  "loading illustration tags...",
  "preparing the library...",
]

export const DB_INIT_MESSAGES = [
  "loading card manifest...",
  "downloading card data...",
  "downloading oracle tags...",
  "preparing oracle tags...",
  "downloading illustration tags...",
  "preparing illustration tags...",
  "downloading set data...",
  "preparing set data...",
  "preparing card entries...",
  "loading cards to memory...",
  "persisting cards to database. search is ready, but don't leave the page or make data changes",
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
  cardByName: (name: string, fuzzy?: boolean) => (NormedCard | undefined)
}

const defaultDB: CogDB = {
  dbStatus: 'unstarted',
  memStatus: 'unstarted',
  memory: [],
  dbReport: null,
  setMemory: () => console.error("CogDB.setMemory called without a provider!"),
  cardByName: () => {
    console.error("CogDB.cardByName called without a provider!")
    return undefined
  },
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

  const [memory, rawSetMemory] = useState<NormedCard[]>([])
  const rezzy = useRef<NormedCard[]>([])

  const oracleToCard = useRef<{ [id: string]: NormedCard}>({})
  const nameToOracle = useRef<{ [name: string]: string }>({})

  const resetIndex = () => {
    oracleToCard.current = {}
    nameToOracle.current = {}
  }
  const addCardToIndex = (card: NormedCard) => {
    if (!isOracleVal("extra")(card)) {
      oracleToCard.current[card.oracle_id] = card
      nameToOracle.current[card.name] = card.oracle_id
      nameToOracle.current[card.name.toLowerCase()] = card.oracle_id
      if (card.name.includes(" // ")) {
        nameToOracle.current[card.name.split(" // ")[0]] = card.oracle_id
        nameToOracle.current[card.name.split(" // ")[0].toLowerCase()] = card.oracle_id
      }
    }
  }
  const setMemory = (setto: SetStateAction<NormedCard[]>) => {
    const res = isFunction(setto) ? setto(memory) : setto
    rawSetMemory(res)
    resetIndex()
    res.forEach(addCardToIndex)
  }

  const [manifest, setManifest] = useState<Manifest>({
    id: 'loading',
    name: 'loading',
    type: 'loading',
    lastUpdated: new Date(),
  })

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
        addCardToIndex(card)
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
      default:
        console.error(`unknown message [${type}] from db worker`)
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
      case "oracle-tag-downloaded":
      case "oracle-tag-end":
      case "illustration-tag-downloaded":
      case "illustration-tag-end":
      case "blocks-downloaded":
      case "blocks-end":
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
        break
      default:
        console.error(`unknown message [${type}] from db worker`)
        break
    }
  }

  const loadDB = async () => {
    console.debug("starting worker")
    // @ts-ignore
    const worker = new Worker(new URL("./dbWorker.ts", import.meta.url))
    rezzy.current = []
    setMemStatus('loading')
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

  const cardByName = (name: string, fuzzy: boolean = false): NormedCard | undefined => {
    // todo: add fuzzing
    const fuzzed = fuzzy ? name : name
    return oracleToCard.current[nameToOracle.current[fuzzed]]
  }

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
    outOfDate: (manifest?.lastUpdated ?? EPOCH) < cogDB.LAST_UPDATE,
    cardByName,
  }
}
