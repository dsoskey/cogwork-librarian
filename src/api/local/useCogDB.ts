import { useEffect, useState } from 'react'
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

  useEffect(() => {
    const inner = async () => {
      setMemStatus('loading')
      let res: NormedCard[] = []
      console.debug(`loading mem ${new Date()}`)
      const count = await cogDB.collection.count()
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
