import React, { useContext } from 'react'
import { SearchOptions } from 'scryfall-sdk'
import { renderQueryInfo, TextEditor } from '../component/textEditor'
import { DataSource, Setter, TaskStatus } from '../../types'
import { ScryfallIcon } from '../component/scryfallIcon'
import { CoglibIcon } from '../component/coglibIcon'
import { InfoModal } from '../component/infoModal'
import { DatabaseSettings } from './databaseSettings'
import { Loader } from '../component/loader'
import { CogDBContext } from '../../api/local/useCogDB'

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
  canRunQuery: boolean
  execute: () => void
  queries: string[]
  setQueries: Setter<string[]>
  options: SearchOptions
  setOptions: Setter<SearchOptions>
  source: DataSource
  setSource: Setter<DataSource>
}

export const QueryForm = ({
  status,
  canRunQuery,
  execute,
  queries,
  setQueries,
  source,
  setSource,
}: QueryFormProps) => {
  const { dbReport } = useContext(CogDBContext)
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
          language='scryfall-extended'
          renderQueryInfo={renderQueryInfo()}
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
          <button
            disabled={!canRunQuery || status === 'loading'}
            onClick={execute}
          >
            {canRunQuery &&
              `scour${status === 'loading' ? 'ing' : ''} the library`}
            {!canRunQuery && `preparing the library`}
            <tool-tip inert role='tooltip' tip-position="bottom">From query editor, press Ctrl/CMD+Enter to submit</tool-tip>
          </button>
          {!canRunQuery && dbReport.totalCards > 0 && <Loader width={750} count={dbReport.cardCount} total={dbReport.totalCards} />}
        </div>
      </div>
    </>
  )
}
