import { humanFileSize } from '../humanFileSize'
import { downloadCards } from '../../api/local/populate'
import { toManifest } from '../../api/local/db'
import React, { useContext, useEffect, useState } from 'react'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
import * as Scry from 'scryfall-sdk'
import { Setter, TaskStatus } from '../../types'
import { CogDBContext } from '../../api/local/useCogDB'

export interface ScryfallImporterProps {


  // should be props
  setDbDirty: Setter<boolean>
  dbImportStatus: TaskStatus
  setDbImportStatus: Setter<TaskStatus>
}
export const ScryfallImporter = ({
  dbImportStatus,
  setDbImportStatus,
  setDbDirty,
}: ScryfallImporterProps) => {
  const { setManifest, setMemory } = useContext(CogDBContext)

  const [targetDefinition, setTargetDefinition] = useState<
    BulkDataDefinition | undefined
  >()
  const [bulkDataDefinitions, setBulkDataDefinitions] = useState<
    BulkDataDefinition[]
  >([])
  useEffect(() => {
    Scry.BulkData.definitions().then((definitions) =>
      setBulkDataDefinitions(definitions.filter((it) => it.type !== 'rulings'))
    )
  }, [])

  const importFromScryfall = async () => {
    if (targetDefinition) {
      setDbImportStatus('loading')
      const cards = await downloadCards(targetDefinition)
      setMemory(cards)
      setManifest(toManifest(targetDefinition))
      setDbDirty(true)
      setDbImportStatus('success')
    }
  }

  return <div className='scryfall-import'>
    {bulkDataDefinitions.map((it) => (
      <div key={it.uri} className='scryfall-option'>
        <input
          id={`source-${it.type}`}
          type='radio'
          value={it.type}
          checked={it.type === targetDefinition?.type}
          onChange={() => setTargetDefinition(it)}
        />
        <label htmlFor={`source-${it.type}`}>{it.name}</label>
        <code className='size'>{humanFileSize(it.size)}</code>
        <div>{it.description}</div>
      </div>
    ))}
    <button
      disabled={
        dbImportStatus === 'loading' || targetDefinition === undefined
      }
      onClick={importFromScryfall}
    >
      import data
    </button>
  </div>
}