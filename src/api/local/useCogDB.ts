import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useState } from 'react'
import { TaskStatus } from '../../types'
import { cogDB, Manifest } from './db'
import { populateDB } from './populate'

export interface CogDB {
    status: TaskStatus
    manifest: Manifest
}

export const useCogDB = (): CogDB => {
    const [status, setStatus] = useState<TaskStatus>('unstarted')
    
    const manifest = useLiveQuery(async () => {
        const results = await cogDB.manifest
            .where('type')
            .equals('oracle_cards')
            .toArray()
        return results[0] ?? null
    }, [])

    useEffect(() => {
        if (manifest !== undefined) {
            setStatus('loading')
            populateDB(manifest)
            .then(() => setStatus('success'))
            .catch(() => setStatus('error'))
        }
    }, [manifest])

    return { status, manifest }
}