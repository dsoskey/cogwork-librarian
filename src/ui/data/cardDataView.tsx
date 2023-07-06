import React, { useContext, useState } from 'react'
import { ObjectValues, Setter, TaskStatus } from '../../types'
import { CogDBContext } from '../../api/local/useCogDB'
import { ScryfallImporter } from './scryfallImporter'
import { CardFileImporter } from './cardFileImporter'
import { CardListImporter } from './cardListImporter'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'

export const IMPORT_SOURCE = {
  scryfall: 'scryfall',
  cubeCobra: 'cubeCobra',
  file: 'file',
  text: 'text',
} as const
export type ImportSource = ObjectValues<typeof IMPORT_SOURCE>

export const sourceToLabel: Record<ImportSource, string> = {
  scryfall: 'scryfall',
  cubeCobra: 'cube cobra',
  file: 'a file',
  text: 'a text list',
}

const dateString = (date: Date) =>
  `${date.getFullYear()}.${date.getMonth().toString().padStart(2, "0")}.${date.getDay().toString().padStart(2, "0")}-${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`

export type ImportTarget = "memory" | "db"
interface TargetCheckboxProps {
  importTargets: ImportTarget[]
  setImportTargets: Setter<ImportTarget[]>
  target: ImportTarget
}

const TargetCheckbox = ({ importTargets, setImportTargets, target }: TargetCheckboxProps) => {
  const checked = importTargets.find(it => it === target) !== undefined
  return <label className={`input-link ${checked ? "active-link" : ""}`}>
    <input type='checkbox' checked={checked} onChange={() => {
      setImportTargets(prev => {
        if (prev.find(it => it === target)) {
          return prev.filter(it => it !== target)
        } else {
          return [...prev, target]
        }
      })
    }}/>
    {target}
  </label>
}

export const CardDataView = () => {
  const { dbStatus, memStatus, manifest, outOfDate, saveToDB, resetDB } = useContext(CogDBContext)
  const dbManifest = useLiveQuery(async () => cogDB.collection.get("the_one"))
  const dbDirty = dbManifest === undefined || manifest.id === 'loading'
    ? false
    : dbManifest.lastUpdated.getTime() !== manifest.lastUpdated.getTime() || dbManifest.id !== manifest.id
  const [dbImportStatus, setDbImportStatus] = useState<TaskStatus>('unstarted')
  const [importSource, setImportSource] = useState<ImportSource>("scryfall")
  const [importTargets, setImportTargets] = useState<ImportTarget[]>(["memory", "db"])

  return <>
    <section className='card-import'>
      <div className='row'>
        <div>
          <h4>in memory {dbImportStatus === 'loading' && '(importing...)'}</h4>
          <div>
            <strong>source:</strong> <code>{manifest.name}</code>
          </div>
          <div>
            <strong>type:</strong> <code>{manifest.type}</code>
          </div>
          <div>
            <strong>last updated:</strong>{' '}
            <code>{dateString(manifest.lastUpdated)}</code>
          </div>
        </div>
        {dbDirty && dbManifest && <div>
          <h4>in database</h4>
          <div>
            <strong>source:</strong> <code>{dbManifest.name}</code>
          </div>
          <div>
            <strong>type:</strong> <code>{dbManifest.type}</code>
          </div>
          <div>
            <strong>last updated:</strong>{' '}
            <code>{dateString(dbManifest.lastUpdated)}</code>
          </div>
        </div>}
      </div>

      {outOfDate && (
        <div className='alert'>
          cogwork librarian's syntax has updated since you last synced
          your database, so new queries may not function. to fix the
          issue, re-import your data file the same way you did last time
          and save to local database. if you've never imported a data set,
          choose "Default Cards" from import from scryfall below.
        </div>
      )}
      {dbDirty && (
        <div className='alert'>
          in-memory data set hasn't been saved to database yet
        </div>
      )}
      <button
        disabled={dbStatus === 'loading' || memStatus === 'loading' || !dbDirty}
        onClick={() => saveToDB()}
      >
        {dbStatus !== 'loading' && memStatus !== 'loading' && !dbDirty
          ? 'database in sync'
          : `sav${
            dbStatus === 'loading' || memStatus === 'loading' ? 'ing' : 'e'
          } to local database`}
      </button>
      {dbDirty && <button
        disabled={dbStatus === 'loading' || memStatus === 'loading'}
        onClick={resetDB}
      >
        {`reload${
          dbStatus === 'loading' || memStatus === 'loading' ? 'ing' : ''
        } local database`}
      </button>}
    </section>

    <section className='db-import'>
      <h4 className='row'>
        <span>import from</span>
        {Object.keys(IMPORT_SOURCE).filter(it => it !== "cubeCobra").map(source => (<label key={source}
          className={`input-link ${source === importSource ? "active-link" : ""}`}
        >
          <input
            id={`import-${source}`}
            type='radio'
            value={source}
            checked={source === importSource}
            onChange={() => setImportSource(source as ImportSource)}
          />
          {sourceToLabel[source]}
        </label>))}
        <span>to</span>
        <TargetCheckbox target='memory' importTargets={importTargets} setImportTargets={setImportTargets} />
        <TargetCheckbox target='db' importTargets={importTargets} setImportTargets={setImportTargets} />
      </h4>
      {importSource === "scryfall" && <ScryfallImporter
        importTargets={importTargets}
        dbImportStatus={dbImportStatus}
        setDbImportStatus={setDbImportStatus}
      />}
      {importSource === "file" && <CardFileImporter
        importTargets={importTargets}
        dbImportStatus={dbImportStatus}
        setDbImportStatus={setDbImportStatus}
      />}
      {importSource === "text" && <CardListImporter
        importTargets={importTargets}
        dbImportStatus={dbImportStatus}
        setDbImportStatus={setDbImportStatus}
      />}
    </section>
  </>
}