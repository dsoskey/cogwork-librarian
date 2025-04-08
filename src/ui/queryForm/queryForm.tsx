import React, { useContext } from 'react'
import { TextEditor } from '../component/editor/textEditor'
import { DataSource, Setter, TaskStatus } from '../../types'
import { ScryfallIcon } from '../icons/scryfallIcon'
import { CoglibIcon } from '../icons/coglibIcon'
import { InfoModal } from '../component/infoModal'
import { CogDBContext } from '../../api/local/useCogDB'
import { MemStatusLoader, DBStatusLoader } from '../component/dbStatusLoader'
import { Link } from 'react-router-dom'
import { ProjectContext } from '../../api/local/useProjectDao'
import { ProjectTabs } from './projectTabs'
import { FlagContext } from '../flags'

const description: Record<DataSource, String> = {
  scryfall:
    'Fetches from Scryfall using its API. Supports full Scryfall syntax, but larger query sets will take longer to process.',
  local:
    'Processes queries against a local database of oracle cards, so it runs an order of magnitude faster than communicating with Scryfall',
}

const DatabaseSettings = () => {
  const { outOfDate } = useContext(CogDBContext)
  return (
    <div className='row'>
      <Link to='/data/card'>
        <button className='db-settings' title='settings'>
          ⚙
        </button>
      </Link>
      {outOfDate && <span className='alert'>DATABASE UPDATE REQUIRED</span>}
    </div>
  )
}

export interface QueryFormProps {
  status: TaskStatus
  execute: (startIndex: number, selectedIndex: number) => void
  source: DataSource
  setSource: Setter<DataSource>
}

export function QueryForm({
  status,
  execute,
  source,
  setSource,
}: QueryFormProps) {
  const { queries, setQueries } = useContext(ProjectContext);
  const { memStatus } = useContext(CogDBContext);
  const { searchSource } = useContext(FlagContext).flags;

  // something about prism overrides the state update for this css class

  const canRunQuery = source === 'scryfall' || memStatus === 'success'
  const canSubmit = canRunQuery && status !== 'loading'
  const iconSize = 30
  return (
    <div className='query-form'>
      <ProjectTabs />
      <div className={source}>
        <TextEditor
          queries={queries}
          setQueries={setQueries}
          onSubmit={execute}
          canSubmit={canSubmit}
          showLineNumbers
          language='scryfall-extended-multi'
        />
      </div>
      {!searchSource && <CombinedStatusLoader />}
      {searchSource &&
        <div className='row center execute-controls'>
          <label><span className='bold'>data source:</span></label>
          <div className={`source-option row center ${source === 'local' ? 'selected' : ''}`}>
            <div className='radio-button-holder'>
              <CoglibIcon
                size={iconSize}
                isActive={source === 'local'}
              />
              <input
                id={`source-local`}
                type='radio'
                value='local'
                checked={source === 'local'}
                onChange={() => setSource('local')}
              />
            </div>
            <label htmlFor={`source-local`}>local</label>
            <DatabaseSettings />
            <InfoModal
              title={<h2 className='row center'>
                <CoglibIcon size={iconSize} />
                <span>data source: local</span>
              </h2>}
              info={description['local']}
            />
          </div>
          <div className={`source-option row center ${source === 'scryfall' ? 'selected' : ''}`}>
            <div className='radio-button-holder'>
              <ScryfallIcon
                isActive={source === 'scryfall'}
                size={iconSize}
              />
              <input
                id={`source-scryfall`}
                type='radio'
                value='scryfall'
                checked={source === 'scryfall'}
                onChange={() => setSource('scryfall')}
              />
            </div>
            <label htmlFor={`source-scryfall`}>Scryfall</label>
            <InfoModal title={<h2 className='row center'>
              <ScryfallIcon size={iconSize} />
              <span>data source: Scryfall</span>
            </h2>} info={description['scryfall']} />
            <CombinedStatusLoader />
          </div>
        </div>}
    </div>
  )
}

function CombinedStatusLoader() {
  const { dbStatus, memStatus } = useContext(CogDBContext);

  return <div className='db-info-holder'>
    <DBStatusLoader />
    <MemStatusLoader />
    {memStatus === "error" || dbStatus === "error" &&
      <div>Go to the <Link to="/data/card">database manager</Link> to fix your import query.</div>}
  </div>
}