import { cloneDeep } from 'lodash'
import React from 'react'
import { SearchOptions, Sort, SortDirection } from 'scryfall-sdk'
import { renderQueryInfo, TextEditor } from '../component/textEditor'
import { DataSource, Setter, TaskStatus } from '../../types'
import { ScryfallIcon } from '../component/scryfallIcon'
import { CoglibIcon } from '../component/coglibIcon'
import { InfoModal } from '../component/infoModal'
import { DatabaseSettings } from './databaseSettings'

const description: Record<DataSource, String> = {
  scryfall:
    'fetches from scryfall using its API. Supports full scryfall syntax, but larger query sets will take longer to process.',
  local:
    'processes queries against a local database of oracle cards. syntax support is incomplete, but it runs an order of magnitude faster than communicating with scryfall',
}

const sortOptions: Array<keyof typeof Sort> = [
  'name',
  // 'set',
  // 'released',
  // 'rarity',
  // 'color', TODO: handle color sort
  // 'usd',
  // 'tix',
  // 'eur',
  'cmc',
  'power',
  'toughness',
  // 'edhrec',
  // 'artist',
]

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
  // slot to put database settings in
}

export const QueryForm = ({
  status,
  canRunQuery,
  execute,
  queries,
  setQueries,
  options,
  setOptions,
  source,
  setSource,
}: QueryFormProps) => {
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
            <InfoModal title={<h2 className='row'><ScryfallIcon
              size={iconSize}
            /><span>data source: scryfall</span></h2>} info={description['scryfall']} />
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

        <span>
          <label htmlFor='sort'>sort by: </label>
          <select
            name='sort'
            value={options.order}
            onChange={(event) => {
              setOptions((prev) => {
                const newVal = cloneDeep(prev)
                newVal.order = event.target.value as keyof typeof Sort
                return newVal
              })
            }}
          >
            {sortOptions.map((it) => (
              <option key={it} value={it}>
                {it}
              </option>
            ))}
          </select>
        </span>

        <span>
          <label htmlFor='dir'>direction: </label>
          <select
            name='dir'
            value={options.dir}
            onChange={(event) => {
              setOptions((prev) => {
                const newVal = cloneDeep(prev)
                newVal.dir = event.target.value as keyof typeof SortDirection
                return newVal
              })
            }}
          >
            {Object.keys(SortDirection)
              .filter((it) => Number.isNaN(Number.parseInt(it)))
              .map((it) => (
                <option key={it} value={it}>
                  {it}
                </option>
              ))}
          </select>
        </span>

        <button
          disabled={!canRunQuery || status === 'loading'}
          onClick={execute}
        >
          {canRunQuery &&
            `scour${status === 'loading' ? 'ing' : ''} the library`}
          {!canRunQuery && `preparing the library`}
        </button>
      </div>
    </>
  )
}
