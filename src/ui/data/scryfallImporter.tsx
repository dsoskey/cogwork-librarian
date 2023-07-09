import { humanFileSize } from '../humanFileSize'
import { downloadNormedCards } from '../../api/local/populate'
import { toManifest } from '../../api/local/db'
import React, { useContext, useEffect, useState } from 'react'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
import * as Scry from 'scryfall-sdk'
import { Setter, TaskStatus } from '../../types'
import { CogDBContext } from '../../api/local/useCogDB'
import { ImportTarget } from './cardDataView'

export interface ScryfallImporterProps {
  importTargets: ImportTarget[]
  dbImportStatus: TaskStatus
  setDbImportStatus: Setter<TaskStatus>
}
export const ScryfallImporter = ({
  importTargets,
  dbImportStatus,
  setDbImportStatus,
}: ScryfallImporterProps) => {
  const { setManifest, setMemory, saveToDB } = useContext(CogDBContext)

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
      const cards = await downloadNormedCards(targetDefinition)
      const manifest = toManifest(targetDefinition)
      if (importTargets.find(it => it === "memory")) {
        setMemory(cards)
        setManifest(manifest)
      }

      if (importTargets.find(it => it === "db")) {
        await saveToDB(manifest, cards)
      }
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