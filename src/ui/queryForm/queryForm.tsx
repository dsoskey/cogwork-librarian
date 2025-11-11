import React, { useContext, useRef } from 'react'
import { TextEditor } from '../component/editor/textEditor'
import { Setter, TaskStatus } from '../../types'
import { CogDBContext } from '../../api/local/useCogDB'
import { MemStatusLoader, DBStatusLoader } from '../component/dbStatusLoader'
import { Link } from 'react-router-dom'
import { ProjectTabs } from './projectTabs'
import { SettingsContext } from '../settingsContext'

const PLACEHOLDERS = [
  'cube:soskgy',
  'Add a query why dont ya!',
  'cube:blue-cube',
  'Why wait for answers? Type a query.',
  'Draft me face up. As you draft a card, you may draft an additional card from that booster pack. If you do, put me into that booster pack.',
  'Only the coolest people read the manual.',
  '@defaultDomain(not:ub -settype:commander)',
  'otag:draft-matters mana=4 pow=3 tou=3'
];

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
  const placeholder = useRef<string>(PLACEHOLDERS[Math.floor(Math.random() * (PLACEHOLDERS.length))]);

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
          enableLinkOverlay
          enableCopyButton
          placeholder={placeholder.current}
        />
      </div>
      <div style={{ position: "fixed" , bottom: 0, right: 0 }}>

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