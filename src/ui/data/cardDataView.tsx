import React, { useContext, useState } from 'react'
import { ObjectValues, Setter, TaskStatus } from '../../types'
import { CogDBContext, ImportTarget } from '../../api/local/useCogDB'
import { ScryfallImporter, ScryfallImporterProps } from './scryfallImporter'
import { CardFileImporter } from './cardFileImporter'
import { CardListImporter } from './cardListImporter'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB, Collection } from '../../api/local/db'
import { TagImporter } from './tagImporter'
import { Input } from '../component/input'
import { FormField } from '../component/formField'
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { DBStatusLoader, MemStatusLoader } from '../component/dbStatusLoader'
import { useLocalStorage } from '../../api/local/useLocalStorage'

const IMPORT_SOURCE = {
  scryfall: 'scryfall',
  mtgjson: 'mtgjson',
  file: 'file',
  text: 'text',
} as const
type ImportSource = ObjectValues<typeof IMPORT_SOURCE>

const SOURCE_TO_LABEL: Record<ImportSource, string> = {
  scryfall: 'scryfall',
  mtgjson: 'MTGJSON',
  file: 'a file',
  text: 'a text list',
}

const dateString = (date: Date) =>
  `${date.getFullYear()}.${(date.getMonth()+1).toString().padStart(2, "0")}.${(date.getDate()+1).toString().padStart(2, "0")}-${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`

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

const ManifestView = ({ manifest }: { manifest: Collection }) => {
  useHighlightPrism([manifest.filter]);
  return <>
    <div>
      <span className="bold">source: </span>
      <code>{manifest.bulkUrl
        ? <a href={manifest.bulkUrl}>{manifest.name}</a>
        : manifest.name
      }</code>
    </div>
    <div>
      <span className="bold">last updated:</span>{' '}
      <code>{dateString(manifest.lastUpdated)}</code>
    </div>
    <div>
      <span className="bold">import filter:</span>{' '}
      {manifest.filter
        ? <code className="language-scryfall">{manifest.filter}</code>
        : <code>No filter</code>}
    </div>
  </>
}

export const CardDataView = () => {
  const { dbStatus, memStatus, manifest, outOfDate, saveToDB, resetDB, loadFilter, setLoadFilter } = useContext(CogDBContext)
  const dbManifest = useLiveQuery(async () => cogDB.collection.get("the_one"))
  const dbDirty = dbManifest === undefined || manifest.id === 'loading'
    ? false
    : dbManifest.lastUpdated.getTime() !== manifest.lastUpdated.getTime() || dbManifest.id !== manifest.id
  const [dbImportStatus, setDbImportStatus] = useState<TaskStatus>('unstarted')
  const [importSource, setImportSource] = useState<ImportSource>("scryfall")
  const [importTargets, setImportTargets] = useState<ImportTarget[]>(["memory", "db"])

  let saveText: string = 'database in sync'
  if (memStatus === 'loading' || dbStatus === 'loading') {
    saveText = 'synchronizing with database'
  } else if (dbDirty) {
    saveText = 'save to database'
  }
  return <>
    <h2>card data</h2>
    <section className='card-import'>
      <div className='row'>
        <div>
          <h3>in memory {dbImportStatus === 'loading' && '(importing...)'}</h3>
          <ManifestView manifest={manifest} />
        </div>
        {dbDirty && dbManifest && <div>
          <h3>in database</h3>
          <ManifestView manifest={dbManifest} />
        </div>}
      </div>

      {outOfDate && (
        <div className='alert'>
          Cogwork Librarian's syntax has updated since you last synced
          your database, so new queries may not function. to fix the
          issue, re-import your data file the same way you did last time
          and save to local database. if you've never imported a data set,
          choose "Default Cards" from import from scryfall below.
        </div>
      )}
      {dbStatus !== 'loading' && memStatus !== 'loading' && dbDirty && (
        <div className='alert'>
          in-memory data set hasn't been saved to database yet
        </div>
      )}
      <FormField
        title="in-memory filter"
        description="load cards that match this query into memory on page load">
        <Input onChange={e => setLoadFilter(e.target.value)} value={loadFilter} language="scryfall" placeholder="No filter will be applied"/>
      </FormField>
      <button
        disabled={dbStatus === 'loading' || memStatus === 'loading'}
        onClick={() => window.location.reload()}>reload page</button>
      <button
        disabled={dbStatus === 'loading' || memStatus === 'loading' || !dbDirty}
        onClick={() => saveToDB()}
      >
        {saveText}
      </button>
      {dbDirty && <button
        disabled={dbStatus === 'loading' || memStatus === 'loading'}
        onClick={resetDB}
      >
        {`reload${
          dbStatus === 'loading' || memStatus === 'loading' ? 'ing' : ''
        } local database`}
      </button>}
      <MemStatusLoader />
    </section>
    {dbStatus === "success" && <TagImporter />}
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
          {SOURCE_TO_LABEL[source]}
        </label>))}
        <span>to</span>
        <TargetCheckbox target='memory' importTargets={importTargets} setImportTargets={setImportTargets} />
        <TargetCheckbox target='db' importTargets={importTargets} setImportTargets={setImportTargets} />
      </h4>
      {importSource === "scryfall" && <ScryfallImporter importTargets={importTargets} />}
      {importSource === "file" && <CardFileImporter
        importTargets={importTargets}
        dbImportStatus={dbImportStatus}
        setDbImportStatus={setDbImportStatus}
      />}
      {importSource === "mtgjson" && <MTGJSONImporter importTargets={importTargets} />}
      {importSource === "text" && <CardListImporter
        importTargets={importTargets}
        dbImportStatus={dbImportStatus}
        setDbImportStatus={setDbImportStatus}
      />}
    </section>
  </>
}

function MTGJSONImporter({ importTargets }: ScryfallImporterProps) {
  const { memStatus, dbStatus, loadMtgJSONDB } = useContext(CogDBContext);
  const [filter, setFilter] = useLocalStorage<string>("db-import-filter-1", "-is:extra ++");

  const importFromMtgJSON = async () => {
      await loadMtgJSONDB(importTargets, filter);
  }

  return <div>
    <div className="alert">Beta feature!</div>
    <p className="prose">
      MTGJSON is an alternate database source to Scryfall.
      It contains the originally printed text and type of most cards, a notable gap in Scryfall's data.
      Cogwork Librarian enables searching on these fields with <code>ogtext</code>, <code>ogtype</code>, <code>has:erratatext</code>, <code>has:erratatype</code>, and <code>has:nooriginaltext</code>.
      While using this beta integration, some other search features may not be available.
    </p>
    <DBStatusLoader />
    <FormField
      title="import filter"
      description="cards that match this filter will be loaded into the database during importing"
    >
      <Input onChange={e => setFilter(e.target.value)} value={filter} language="scryfall" placeholder="No filter will be applied" />
    </FormField>
    <button
      disabled={dbStatus === 'loading' || memStatus === 'loading'}
      onClick={importFromMtgJSON}>
      import
    </button>
  </div>
}