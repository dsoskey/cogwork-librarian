import { humanFileSize } from '../humanFileSize'
import { toManifest } from '../../api/local/db'
import React, { useContext, useEffect, useState } from 'react'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
import * as Scry from 'scryfall-sdk'
import { CogDBContext, DB_INIT_MESSAGES } from '../../api/local/useCogDB'
import { ImportTarget } from './cardDataView'
import { Loader } from '../component/loader'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { Input } from '../component/input'
import { FormField } from '../component/formField'

export interface ScryfallImporterProps {
  importTargets: ImportTarget[]
}
export const ScryfallImporter = ({ importTargets }: ScryfallImporterProps) => {
  const { memStatus, dbStatus, dbReport, loadManifest } = useContext(CogDBContext)

  const [targetDefinition, setTargetDefinition] = useState<BulkDataDefinition | undefined>();
  const [bulkDataDefinitions, setBulkDataDefinitions] = useState<BulkDataDefinition[]>([]);
  const [filter, setFilter] = useLocalStorage<string>("db-import-filter", "is:extra");

  useEffect(() => {
    Scry.BulkData.definitions().then((definitions) => {
      setBulkDataDefinitions(definitions.filter((it) => it.type !== 'rulings'))
      setTargetDefinition(definitions.find(it => it.type === 'default_cards'))
    })
  }, [])

  const importFromScryfall = async () => {
    if (targetDefinition) {
      await loadManifest(toManifest(targetDefinition), importTargets, filter)
    }
  }

  return <div className='scryfall-import'>
    {bulkDataDefinitions.map((it) => (
      <div key={it.uri} className="scryfall-option">
        <div className='scryfall-input'>
          <input
            id={`source-${it.type}`}
            type='radio'
            value={it.type}
            checked={it.type === targetDefinition?.type}
            onChange={() => setTargetDefinition(it)}
          />
          <label className={it.type === targetDefinition?.type ? "checked" : ""} htmlFor={`source-${it.type}`}>
            {it.name}
            <code className='size'>{humanFileSize(it.size)}</code>
          </label>
        </div>

        <div>{it.description}</div>
      </div>
    ))}
    {dbStatus === 'loading' && <>
      <span>{DB_INIT_MESSAGES[dbReport.complete]}</span>
      <div className='column'>
        <Loader width={500} count={dbReport.complete} total={dbReport.totalQueries} />
        {memStatus === "loading" && dbReport.totalCards > 0 && <Loader
          width={500} label='cards loaded'
          count={dbReport.cardCount} total={dbReport.totalCards}
        />}
      </div>
    </>}
    <FormField
      title="import filter"
      description="cards that match this filter will be loaded into the database during importing"
    >
      <Input onChange={e => setFilter(e.target.value)} value={filter} language="scryfall" />
    </FormField>
    <button
      disabled={dbStatus === 'loading' || memStatus === 'loading' || targetDefinition === undefined}
      onClick={importFromScryfall}
    >
      import data
    </button>
  </div>
}