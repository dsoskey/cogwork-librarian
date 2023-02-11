import { useEffect, useState } from 'react'
import { Setter, TaskStatus } from '../../types'
import { cogDB, CollectionMetadata, toMetadata } from './db'
import { downloadCards, putFile } from './populate'
import { useLocalStorage } from './useLocalStorage'
import { NormedCard } from './normedCard'
import * as Scry from 'scryfall-sdk'

export interface CogDB {
  dbStatus: TaskStatus
  memStatus: TaskStatus
  memory: NormedCard[]
  setMemory: Setter<NormedCard[]>
  manifest: CollectionMetadata
  setManifest: Setter<CollectionMetadata>
  saveToDB: () => Promise<void>
}

export const useCogDB = (): CogDB => {
  const [dbStatus, setDbStatus] = useState<TaskStatus>('unstarted')
  const [memStatus, setMemStatus] = useState<TaskStatus>('unstarted')
  const [memory, setMemory] = useState<NormedCard[]>([])
  const [manifest, setManifest] = useLocalStorage<
    CollectionMetadata | undefined
  >('manifest', undefined)

  const saveToDB = async () => {
    setDbStatus('loading')
    try {
      await putFile(manifest, memory)
      setDbStatus('success')
    } catch (e) {
      setDbStatus('error')
    }
  }

  useEffect(() => {
    const inner = async () => {
      setMemStatus('loading')
      let res: NormedCard[] = []
      console.debug(`loading mem ${new Date()}`)
      const count = await cogDB.collection.count()
      console.debug(`counted ${count} cards!`)
      if (count === 0) {
        setDbStatus('loading')
        console.debug('refreshing db')
        try {
          const newManifest = toMetadata(
            await Scry.BulkData.definitionByType('default_cards'))
          setManifest(newManifest)
          res = await downloadCards(newManifest)
          await putFile(newManifest, res)
          setDbStatus('success')
        } catch (_) {
          setDbStatus('error')
        }
      } else {
        const { blob, ...manifest } = (
          await cogDB.collection.limit(1).toArray()
        )[0]
        res = JSON.parse(await blob.text())
        setManifest(manifest)
      }
      console.debug(`loaded res ${new Date()}`)

      setMemory(res)
      setMemStatus('success')
    }
    inner().catch(() => setMemStatus('error'))
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
