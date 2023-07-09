import React, { useContext, useMemo } from 'react'
import { SearchOptions } from 'scryfall-sdk'
import { TextEditor } from '../component/editor/textEditor'
import { DataSource, Setter, TaskStatus } from '../../types'
import { ScryfallIcon } from '../component/scryfallIcon'
import { CoglibIcon } from '../component/coglibIcon'
import { InfoModal } from '../component/infoModal'
import { DatabaseSettings } from './databaseSettings'
import { Loader } from '../component/loader'
import { CogDBContext, DB_INIT_MESSAGES } from '../../api/local/useCogDB'
import { FlagContext } from '../../flags'
import { multiQueryInfo } from '../component/editor/multiQueryActionBar'
import { singleQueryInfo } from '../component/editor/singleQueryActionBar'
import { Language } from '../../api/local/syntaxHighlighting'

const description: Record<DataSource, String> = {
  scryfall:
    'fetches from scryfall using its API. Supports full scryfall syntax, but larger query sets will take longer to process.',
  local:
    'processes queries against a local database of oracle cards. syntax support is incomplete, but it runs an order of magnitude faster than communicating with scryfall',
}

const ScryfallLink = () => (
  <a href='https://scryfall.com/docs/syntax' rel='noreferrer' target='_blank'>
    scryfall query
  </a>
)

export interface QueryFormProps {
  status: TaskStatus
  execute: (startIndex: number) => void
  queries: string[]
  setQueries: Setter<string[]>
  options: SearchOptions
  setOptions: Setter<SearchOptions>
  source: DataSource
  setSource: Setter<DataSource>
}

export const QueryForm = ({
  status,
  execute,
  queries,
  setQueries,
  source,
  setSource,
}: QueryFormProps) => {
  const { dbReport, memStatus, dbStatus } = useContext(CogDBContext)
  const { multiQuery } = useContext(FlagContext).flags
  const renderQueryInfo = useMemo(multiQuery ? multiQueryInfo : singleQueryInfo, [multiQuery])
  // something about prism overrides the state update for this css class
  const language: Language = `scryfall-extended${multiQuery ? '-multi' : ""}`

  const canRunQuery = source === 'scryfall' || memStatus === 'success'
  const canSubmit = canRunQuery && status !== 'loading'
  const iconSize = 30
  return (
    <>
      <div className={`column ${source}`}>
        <label>
          enter a base <ScryfallLink /> to include in each subquery, and enter
          any number of subqueries to combine with the base query, one per row.
          exclude subqueries by adding a{' '}
          <code className='language-scryfall-extended'>#</code> at the beginning
          of the row
        </label>
        <TextEditor
          queries={queries}
          setQueries={setQueries}
          onSubmit={execute}
          canSubmit={canSubmit}
          language={language}
          renderQueryInfo={renderQueryInfo}
        />
      </div>

      <div className='row execute-controls'>
        <div className='row'>
          <label>data source:</label>
          <div className={`source-option row ${source === 'scryfall' ? 'selected' : ''}`}>
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
            <label htmlFor={`source-scryfall`}>scryfall</label>
            <InfoModal title={<h2 className='row'>
              <ScryfallIcon size={iconSize} />
              <span>data source: scryfall</span>
            </h2>} info={description['scryfall']} />
          </div>

          <div className={`source-option row ${source === 'local' ? 'selected' : ''}`}>
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
            {<DatabaseSettings />}
            <InfoModal
              title={<h2 className='row'>
                <CoglibIcon size={iconSize} />
                <span>data source: local</span>
              </h2>}
              info={description['local']}
            />
          </div>
        </div>
        <div className='scour-button-holder'>
          {!multiQuery && <button
            disabled={!canSubmit}
            onClick={() => execute(0)}
          >
            {canRunQuery &&
              `scour${status === 'loading' ? 'ing' : ''} the library`}
            {!canRunQuery && `preparing the library`}
          </button>}
          {dbStatus === 'loading' && <>
            <span>{DB_INIT_MESSAGES[dbReport.complete]}</span>
            <div className='column'>
              <Loader width="100%" count={dbReport.complete} total={dbReport.totalQueries} />
              {memStatus === "loading" && dbReport.totalCards > 0 && <Loader
                width="100%" label='cards loaded'
                count={dbReport.cardCount} total={dbReport.totalCards}
              />}
            </div>
          </>}
          {dbStatus !== 'loading' && memStatus === "loading" && dbReport.totalCards > 0 && <>
            <span>preparing the library...</span>
            <Loader width="100%" count={dbReport.cardCount} total={dbReport.totalCards} label='cards loaded' />
          </>}
        </div>
      </div>
    </>
  )
}
