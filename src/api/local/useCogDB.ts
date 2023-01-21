import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useState } from 'react'
import { TaskStatus } from '../../types'
import { cogDB, Manifest } from './db'
import { populateDB } from './populate'
import { Card } from 'scryfall-sdk'

export interface CogDB {
  dbStatus: TaskStatus
  memoryStatus: TaskStatus
  memory: Card[]
  manifest: Manifest
}

export const useCogDB = (): CogDB => {
  const [dbStatus, setDbStatus] = useState<TaskStatus>('unstarted')
  const [memoryStatus, setMemoryStatus] = useState<TaskStatus>('unstarted')

  const manifest = useLiveQuery(async () => {
    const results = await cogDB.manifest
      .where('type')
      .equals('oracle_cards')
      .toArray()
    return results[0] ?? null
  }, [])

  useEffect(() => {
    if (manifest !== undefined) {
      setDbStatus('loading')
      populateDB(manifest)
        .then(() => setDbStatus('success'))
        .catch(() => setDbStatus('error'))
    }
  }, [manifest])

  const _memoryDB = useLiveQuery(async () => {
    if (dbStatus === 'success') {
      setMemoryStatus('loading')
      const res = await cogDB.card.toArray()
      setMemoryStatus('success')
      return res
    }
    return []
  }, [dbStatus])
  const memory = useMemo(
    () => (_memoryDB ?? []).map(Card.construct),
    [_memoryDB]
  )

  return { dbStatus, memoryStatus, manifest, memory }
}
