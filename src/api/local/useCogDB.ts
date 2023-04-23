import { createContext, useEffect, useState } from 'react'
import { Setter, TaskStatus } from '../../types'
import { cogDB, Manifest, toManifest } from './db'
import { downloadCards, putFile } from './populate'
import { NormedCard } from './normedCard'
import * as Scry from 'scryfall-sdk'

export interface CogDB {
  dbStatus: TaskStatus
  memStatus: TaskStatus
  memory: NormedCard[]
  setMemory: Setter<NormedCard[]>
  manifest: Manifest
  setManifest: Setter<Manifest>
  saveToDB: () => Promise<void>
}

const defaultDB: CogDB = {
  dbStatus: 'unstarted',
  memStatus: 'unstarted',
  memory: [],
  setMemory: () => console.error("CogDB.setMemory called without a provider!"),
  manifest: {
    id: '',
    name: '',
    type: '',
    lastUpdated: new Date(),
  },
  setManifest: () => console.error("CogDB.setManifest called without a provider!"),
  saveToDB: () => Promise.reject("CogDB.saveToDB called without a provider!"),
}

export const CogDBContext = createContext(defaultDB)

export const useCogDB = (): CogDB => {
  const [dbStatus, setDbStatus] = useState<TaskStatus>('unstarted')
  const [memStatus, setMemStatus] = useState<TaskStatus>('unstarted')
  const [memory, setMemory] = useState<NormedCard[]>([])
  const [manifest, setManifest] = useState<Manifest>({
    id: 'loading',
    name: 'loading',
    type: 'loading',
    lastUpdated: new Date(),
  })

  const saveToDB = async () => {
    setDbStatus('loading')
    try {
      await putFile(manifest, memory)
      setDbStatus('success')
    } catch (e) {
      setDbStatus('error')
    }
  }

  const loadDB = async () => {
    setMemStatus('loading')
    let res: NormedCard[] = []
    console.time(`loading mem`)
    const count = await cogDB.collection.count()
    console.timeLog(`loading mem`)
    console.debug(`counted ${count} collections!`)
    if (count === 0) {
      setDbStatus('loading')
      console.debug('refreshing db')
      try {
        const bulkDataDefinition = await Scry.BulkData.definitionByType(
          'default_cards'
        )
        const newManifest = toManifest(bulkDataDefinition)
        setManifest(newManifest)
        res = await downloadCards(bulkDataDefinition)
        await putFile(newManifest, res)
        setDbStatus('success')
      } catch (_) {
        setDbStatus('error')
      }
    } else {
      console.timeLog(`loading mem`)
      console.debug("pulling collection")
      const result = (
        await cogDB.collection.limit(1).toArray()
      )[0]
      console.timeLog(`loading mem`)
      console.debug("extracting text from blob")
      const text = await result.blob.text()
      console.timeLog(`loading mem`)
      console.debug("parsing text")
      res = JSON.parse(text)
      setManifest(result)
    }
    console.timeEnd(`loading mem`)

    setMemory(res)
    setMemStatus('success')
  }

  useEffect(() => {
    loadDB().catch(() => setMemStatus('error'))
  }, [])

  return {
    dbStatus,
    saveToDB,
    memStatus,
    manifest,
    setManifest,
    memory,
    setMemory,
  }
}
