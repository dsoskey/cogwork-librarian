import React, { useContext, useState } from 'react'
import { ObjectValues, TaskStatus } from '../../types'
import { CogDBContext } from '../../api/local/useCogDB'
import { ScryfallImporter } from './scryfallImporter'
import { CardFileImporter } from './cardFileImporter'
import { CardListImporter } from './cardListImporter'

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


export const CardDataView = () => {
  const { dbStatus, memStatus, manifest, outOfDate, saveToDB, resetDB } = useContext(CogDBContext)
  const [dbDirty, setDbDirty] = useState<boolean>(false)
  const [dbImportStatus, setDbImportStatus] = useState<TaskStatus>('unstarted')
  const [importType, setImportType] = useState<ImportSource>("scryfall")

  const saveMemoryToDB = () => {
    saveToDB().then(() => setDbDirty(false))
  }
  const loadDBIntoMemory = () => {
    resetDB().then(() => setDbDirty(false))
  }

  return <>
    <section className='card-import'>
      <h4>in memory {dbImportStatus === 'loading' && '(importing...)'}</h4>
      <div>
        <strong>source:</strong> <code>{manifest.name}</code>
      </div>
      <div>
        <strong>type:</strong> <code>{manifest.type}</code>
      </div>
      <div>
        <strong>last updated:</strong>{' '}
        <code>{manifest.lastUpdated.toString()}</code>
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
        onClick={saveMemoryToDB}
      >
        {dbStatus !== 'loading' && memStatus !== 'loading' && !dbDirty
          ? 'database in sync'
          : `sav${
            dbStatus === 'loading' || memStatus === 'loading' ? 'ing' : 'e'
          } to local database`}
      </button>
      {dbDirty && <button
        disabled={dbStatus === 'loading' || memStatus === 'loading'}
        onClick={loadDBIntoMemory}
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
          className={`input-link ${source === importType ? "active-link" : ""}`}
        >
          <input
            id={`import-${source}`}
            type='radio'
            value={source}
            checked={source === importType}
            onChange={() => setImportType(source as ImportSource)}
          />
          {sourceToLabel[source]}
        </label>))}
      </h4>
      {importType === "scryfall" && <ScryfallImporter
        dbImportStatus={dbImportStatus}
        setDbImportStatus={setDbImportStatus}
        setDbDirty={setDbDirty}
      />}
      {importType === "file" && <CardFileImporter
        dbImportStatus={dbImportStatus}
        setDbImportStatus={setDbImportStatus}
        setDbDirty={setDbDirty}
      />}
      {importType === "text" && <CardListImporter
        setDbDirty={setDbDirty}
        dbImportStatus={dbImportStatus}
        setDbImportStatus={setDbImportStatus}
      />}
    </section>
  </>
}