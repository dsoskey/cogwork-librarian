import { createContext, useEffect, useRef, useState } from 'react'
import { Setter, TaskStatus } from '../../types'
import { cogDB, Manifest } from './db'
import { migrateCubes, putFile } from './populate'
import { NormedCard } from '../memory/types/normedCard'
import { QueryReport, useReporter } from '../useReporter'

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
  const onWorkerMessage = (event: MessageEvent): any => {
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

  const newLoadDB = async () => {
    console.debug("starting worker")
    // @ts-ignore
    const worker = new Worker(new URL("./dbWorker.ts", import.meta.url))
    rezzy.current = []
    dbReport.reset(0)
    setMemStatus('loading')
    console.time(`loading mem`)

    console.debug("configuring worker")
    // @ts-ignore
    worker.onmessage = onWorkerMessage
    const count = await cogDB.collection.count()
    console.debug(`counted ${count} collections!`)
    if (count === 0) {
      setDbStatus('loading')
      console.debug('refreshing db')
      worker.postMessage({ type: 'init' })
    } else {
      console.debug("posting start message to worker")
      worker.postMessage({ type: 'load' })
    }

  }

  const resetDB = async () => {
    try {
      console.time("migrated cubes")
      await migrateCubes()
      console.timeEnd("migrated cubes")
      await newLoadDB()
    } catch (e) {
      console.error(e)
      setMemStatus('error')
    }
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
    dbReport,
    outOfDate: (manifest?.lastUpdated ?? EPOCH) < cogDB.LAST_UPDATE
  }
}
