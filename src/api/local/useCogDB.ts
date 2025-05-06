import { createContext, SetStateAction, useRef, useState } from 'react'
import { Setter, TaskStatus } from '../../types'
import { cogDB, isScryfallManifest, Manifest } from './db'
import { migrateCubes, putFile } from './populate'
import { NormedCard, isOracleVal, normCardList, SearchError } from 'mtgql'
import { QueryReport, useReporter } from '../useReporter'
import _isFunction  from 'lodash/isFunction'
import { useLocalStorage } from './useLocalStorage'
import { defaultPromise } from '../context'
import { CubeCard } from 'mtgql/build/types/cube'
import * as Scryfall from 'scryfall-sdk'
import { displayMessage } from '../../error'
import { CompletionTree } from './completionTree'

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
  cardByOracle: (id: string) => NormedCard | undefined
  bulkCardByOracle: (oracleIds: string[]) => Promise<NormedCard[]>
  bulkCardByCubeList: (cards: CubeCard[]) => Promise<NormedCard[]>
  handleAutocomplete: (input: string) => Promise<string[]>
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
  cardByName: (name: string, fuzzy?: boolean) => (NormedCard | undefined)
}

const defaultDB: CogDB = {
  dbStatus: 'unstarted',
  dbError: "",
  memStatus: 'unstarted',
  memError: "",
  memory: [],
  cardByOracle: () => {
    console.error("CogDB.cardByOracle called without a provider!")
    return undefined
  },
  bulkCardByOracle: defaultPromise("CogDB.bulkCardByOracle"),
  handleAutocomplete: defaultPromise("CogDB.handleAutocomplete"),
  bulkCardByCubeList: defaultPromise("CogDB.bulkCardByCubeList"),
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

  const oracleToCard = useRef<{ [id: string]: NormedCard}>({})
  const nameToOracle = useRef<{ [name: string]: string }>({})
  const completionTree = useRef<CompletionTree>(new CompletionTree())

  const resetIndex = () => {
    oracleToCard.current = {}
    nameToOracle.current = {}
    completionTree.current = new CompletionTree();
  }
  const addCardToIndex = (card: NormedCard) => {
    if (!isOracleVal("extra")(card)) {
      oracleToCard.current[card.oracle_id] = card
      nameToOracle.current[card.name] = card.oracle_id
      nameToOracle.current[card.name.toLowerCase()] = card.oracle_id
      completionTree.current.addToTree(card.name)
      if (card.name.includes(" // ")) {
        const [left, right] = card.name.split(" // ");
        nameToOracle.current[left] = card.oracle_id
        nameToOracle.current[left.toLowerCase()] = card.oracle_id
      }
    }
  }
  const setMemory = (setto: SetStateAction<NormedCard[]>) => {
    const res = _isFunction(setto) ? setto(memory) : setto
    rawSetMemory(res)
    resetIndex()
    res.forEach(addCardToIndex)
  }

  const [loadFilter, setLoadFilter] = useLocalStorage<string>("load-filter", "")
  const [manifest, setManifest] = useState<Manifest>({
    id: 'loading',
    name: 'loading',
    type: 'loading',
    lastUpdated: new Date(),
    filter: "",
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
  }

  const loadDB = async () => {
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

  const loadManifest = async (manifest: Manifest, targets: ImportTarget[], filter: string) => {
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
  }

  const loadMtgJSONDB = async (targets: ImportTarget[], filter: string) => {
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

  }

  const cardByName = (name: string, fuzzy: boolean = false): NormedCard | undefined => {
    // todo: add fuzzing
    const fuzzed = fuzzy ? name : name
    return oracleToCard.current[nameToOracle.current[fuzzed]]
  }

  const cardByOracle = (oracleId: string): NormedCard | undefined => {
    return oracleToCard.current[oracleId];
  }

  // this looks pretty generalizable ngl
  const bulkCardByOracle = async (oracleIds: string[]) => {
    const memOracles = oracleIds.map(cardByOracle)
    const missingMemoryIndices = memOracles
      .map((card, index) => card === undefined ? index : -1)
      .filter(index => index !== -1)
    if (missingMemoryIndices.length === 0) return memOracles;

    const oraclesToCheckDB = missingMemoryIndices.map(index => oracleIds[index]);
    const newOracles = (await cogDB.card.bulkGet(oraclesToCheckDB)) ?? [];
    const missingIndexes = newOracles
      .map((card, index) => card === undefined ? index : -1)
      .filter(index => index !== -1)

    if (missingIndexes.length) return Promise.reject(missingIndexes);

    for (let i = 0; i < missingMemoryIndices.length; i++){
      const index = missingMemoryIndices[i]
      memOracles[index] = newOracles[i]
    }
    return memOracles
  }

  const bulkCardByCubeList = async (cubeList: CubeCard[]) => {
    const result = cubeList.map(it => cardByOracle(it.oracle_id))
    const missingMemoryIndices = result
      .map((card, index) => card === undefined ? index : -1)
      .filter(index => index !== -1)
    if (missingMemoryIndices.length === 0) return result;

    const oraclesToCheckDB = missingMemoryIndices.map(index => cubeList[index].oracle_id);
    const newOracles = (await cogDB.card.bulkGet(oraclesToCheckDB)) ?? [];
    const missingDBIndexes = newOracles
      .map((card, index) => card === undefined ? index : -1)
      .filter(index => index !== -1)

    for (let i = 0; i < missingMemoryIndices.length; i++){
      const index = missingMemoryIndices[i]
      result[index] = newOracles[i]
    }
    if (missingDBIndexes.length === 0) return result

    const toCheckScryfall = missingDBIndexes
      .map(index => Scryfall.CardIdentifier.byId(cubeList[missingMemoryIndices[index]].print_id));
    const scryfallCards = await Scryfall.Cards.collection(...toCheckScryfall).waitForAll();
    if (scryfallCards.not_found.length) return Promise.reject(scryfallCards.not_found);

    for (let i = 0; i < missingDBIndexes.length; i++){
      const index = missingMemoryIndices[missingDBIndexes[i]]
      result[index] = normCardList([scryfallCards[i]])[0];
    }
    return result
  }

  return {
    dbStatus,
    dbError,
    saveToDB,
    memStatus,
    memError,
    manifest,
    setManifest,
    memory,
    cardByOracle,
    bulkCardByOracle,
    bulkCardByCubeList,
    handleAutocomplete,
    setMemory,
    resetDB,
    loadManifest,
    loadMtgJSONDB,
    dbReport,
    outOfDate: (manifest?.lastUpdated ?? EPOCH) < cogDB.LAST_UPDATE,
    cardByName,
    loadFilter,
    setLoadFilter
  }

  async function handleAutocomplete(input: string) {
    return completionTree.current.getCompletions(input);
  }
}
