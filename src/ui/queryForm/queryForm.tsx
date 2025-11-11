import React, { useContext } from 'react'
import { TextEditor } from '../component/editor/textEditor'
import { Setter, TaskStatus } from '../../types'
import { CogDBContext } from '../../api/local/useCogDB'
import { MemStatusLoader, DBStatusLoader } from '../component/dbStatusLoader'
import { Link } from 'react-router-dom'
import { ProjectTabs } from './projectTabs'
import { SettingsContext } from '../settingsContext'

export interface QueryFormProps {
  status: TaskStatus
  execute: (startIndex: number, selectedIndex: number) => void
  queries: string[]
  setQueries: Setter<string[]>
  settingsButton?: React.ReactNode;
  historyButton?: React.ReactNode;
}

export function QueryForm({
  status,
  execute,
  settingsButton,
  queries,
  setQueries,
  historyButton,
}: QueryFormProps) {
  const { memStatus } = useContext(CogDBContext);
  const { lineHeight } = useContext(SettingsContext);

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
          settingsButton={<>{settingsButton}{historyButton}</>}
          language='scryfall-extended-multi'
          lineHeight={lineHeight}
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