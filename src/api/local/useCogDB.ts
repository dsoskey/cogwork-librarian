import { useEffect, useState } from 'react'
import { Setter, TaskStatus } from '../../types'
import { cogDB, Manifest } from './db'
import { putCards, putManifest } from './populate'
import { Card } from 'scryfall-sdk'
import { useLocalStorage } from './useLocalStorage'

export interface CogDB {
  dbStatus: TaskStatus
  memStatus: TaskStatus
  memory: Card[]
  setMemory: Setter<Card[]>
  manifest: Manifest
  setManifest: Setter<Manifest>
  saveToDB: () => Promise<void>
}

export const useCogDB = (): CogDB => {
  const [dbStatus, setDbStatus] = useState<TaskStatus>('unstarted')
  const [memStatus, setMemStatus] = useState<TaskStatus>('unstarted')
  const [memory, setMemory] = useState<Card[]>([])
  const [manifest, setManifest] = useLocalStorage<Manifest | undefined>(
    'manifest',
    undefined
  )

  const saveToDB = async () => {
    try {
      setDbStatus('loading')
      await cogDB.card.clear()
      await cogDB.card.bulkPut(memory)
      setDbStatus('success')
    } catch (e) {
      setDbStatus('error')
    }
  }

  useEffect(() => {
    const inner = async () => {
      setMemStatus('loading')
      let res = []
      console.debug(`loading mem ${new Date()}`)
      const count = await cogDB.card.count()
      console.debug(`counted ${count} cards!`)
      if (count === 0) {
        setDbStatus('loading')
        console.debug('refreshing db')
        try {
          const newManifest = await putManifest('oracle_cards')
          setManifest(newManifest)
          res.push(... await putCards(newManifest))
          setDbStatus('success')
        } catch (_) {
          setDbStatus('error')
        }
      } else {
        // TODO: Explore storing db as json file instead of individual cards
        let offset = 0
        const limit = 40000
        let temp = await cogDB.card.limit(limit).toArray()
        while (temp.length) {
          res.push(...temp)
          offset += limit
          temp = await cogDB.card.offset(offset).limit(limit).toArray()
        }
      }
      console.log(`loaded res ${new Date()}`)

      setMemory(res.map(Card.construct))
      setMemStatus('success')
    }
    inner().catch(() => setMemStatus('error'))
  }, [])

  return {
    dbStatus, saveToDB, memStatus, manifest, setManifest, memory, setMemory }
}
