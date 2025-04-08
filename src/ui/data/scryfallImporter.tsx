import { humanFileSize } from '../humanFileSize'
import { toManifest } from '../../api/local/db'
import React, { useContext, useEffect, useState } from 'react'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
import * as Scry from 'scryfall-sdk'
import { CogDBContext, DB_INIT_MESSAGES, ImportTarget } from '../../api/local/useCogDB'
import { LoaderBar } from '../component/loaders'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { Input } from '../component/input'
import { FormField } from '../component/formField'
import { parseISO } from 'date-fns'
import { DBStatusLoader } from '../component/dbStatusLoader'
import { ScryfallIcon } from '../icons/scryfallIcon'

export interface ScryfallImporterProps {
  importTargets: ImportTarget[]
}

const OUTPUT_FORMAT = "YYYY-MM-dd HH:mm"
export const ScryfallImporter = ({ importTargets }: ScryfallImporterProps) => {
  const { memStatus, dbStatus, loadManifest } = useContext(CogDBContext)

  const [targetDefinition, setTargetDefinition] = useState<BulkDataDefinition | undefined>();
  const [bulkDataDefinitions, setBulkDataDefinitions] = useState<BulkDataDefinition[]>([]);
  const [filter, setFilter] = useLocalStorage<string>("db-import-filter-1", "-is:extra ++");

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
          <label className={`scryfall-input${it.type === targetDefinition?.type ? " checked" : ""}`} htmlFor={`source-${it.type}`}>
            <ScryfallIcon size={24} isActive={it.type === targetDefinition?.type} />
            <input
              id={`source-${it.type}`}
              type='radio'
              value={it.type}
              checked={it.type === targetDefinition?.type}
              onChange={() => setTargetDefinition(it)}
            />
            {it.name}
            <code className='size'>{humanFileSize(it.size)}</code>
            {" "}{parseISO(it.updated_at).toLocaleString()}
          </label>

        <div>{it.description}</div>
      </div>
    ))}
    <DBStatusLoader />
    <FormField
      title="import filter"
      description="cards that match this filter will be loaded into the database during importing"
    >
      <Input onChange={e => setFilter(e.target.value)} value={filter} language="scryfall" placeholder="No filter will be applied" />
    </FormField>
    <button
      disabled={dbStatus === 'loading' || memStatus === 'loading' || targetDefinition === undefined}
      onClick={importFromScryfall}
    >
      import data
    </button>
  </div>
}