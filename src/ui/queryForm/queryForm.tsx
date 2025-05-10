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
  queries: string[]
  setQueries: Setter<string[]>
  settingsButton?: React.ReactNode;
}

export function QueryForm({
  status,
  execute,
  settingsButton,
  queries,
  setQueries,
}: QueryFormProps) {
  const { memStatus } = useContext(CogDBContext);

  // something about prism overrides the state update for this css class

  const canSubmit = memStatus === 'success' && status !== 'loading'
  return (
    <div className='query-form'>
      <ProjectTabs />
      <div className='local'>
        <TextEditor
          queries={queries}
          setQueries={setQueries}
          onSubmit={execute}
          canSubmit={canSubmit}
          settingsButton={settingsButton}
          language='scryfall-extended-multi'
        />
      </div>
      <CombinedStatusLoader />
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