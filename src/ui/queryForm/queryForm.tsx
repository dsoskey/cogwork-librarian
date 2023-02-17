import { cloneDeep } from 'lodash'
import React from 'react'
import { SearchOptions, Sort, SortDirection } from 'scryfall-sdk'
import { TextEditor } from '../component/textEditor'
import { DataSource, DATA_SOURCE, Setter, TaskStatus } from '../../types'
import { Input } from '../component/input'
import { AppInfo } from '../appInfo'
import { ExampleGallery } from './exampleGallery'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { ExpanderButton } from '../component/expanderButton'
import { ScryfallIcon } from '../../api/scryfall/scryfallIcon'
import { CoglibIcon } from '../../api/memory/coglibIcon'

const description: Record<DataSource, String> = {
  scryfall:
    'fetches from scryfall using its API. Supports full scryfall syntax, but large query sets will take longer.',
  local:
    'processes queries against a local database of oracle cards. Syntax is currently limited to play-relevant card fields, but local processing is significantly faster than scryfall',
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
  prefix: string
  setPrefix: Setter<string>
  options: SearchOptions
  setOptions: Setter<SearchOptions>
  source: DataSource
  setSource: Setter<DataSource>
  // slot to put database settings in
  dbSettings: React.ReactNode
}

export const QueryForm = ({
  prefix,
  setPrefix,
  status,
  canRunQuery,
  execute,
  queries,
  setQueries,
  options,
  setOptions,
  source,
  setSource,
  dbSettings,
}: QueryFormProps) => {
  const [showOptions, setShowOptions] = useLocalStorage<boolean>(
    'showSearchOptions',
    true
  )
  const iconSize = 30
  return (
    <>
      <div className={`column ${source}`}>
        <label>
          enter a base <ScryfallLink /> to include in each subquery
        </label>
        <Input
          value={prefix}
          onChange={(e) => {
            setPrefix(e.target.value)
          }}
          language='scryfall-extended'
        />
      </div>

      <div className={`column ${source}`}>
        <label>
          enter one or more subqueries to combine with the base query, one per
          row. exclude rows by adding a{' '}
          <code className='language-scryfall-extended'>#</code> at the beginning
          of the row
        </label>
        <TextEditor
          queries={queries}
          setQueries={setQueries}
          language='scryfall-extended'
        />
      </div>

      <div className='execute'>
        <button
          disabled={!canRunQuery || status === 'loading'}
          onClick={execute}
        >
          {canRunQuery &&
            `scour${status === 'loading' ? 'ing' : ''} the library`}
          {!canRunQuery && `preparing the library`}
        </button>

        <ExampleGallery setPrefix={setPrefix} setQueries={setQueries} />

        <AppInfo />
      </div>

      <h2>
        search options{' '}
        <ExpanderButton open={showOptions} setOpen={setShowOptions} />
      </h2>
      {showOptions && (
        <>
          <fieldset>
            <legend>data source:</legend>
            <div className='row source-select'>
              {/* TODO: de-loop */}
              {Object.keys(DATA_SOURCE).map((it: DataSource) => (
                <div
                  key={it}
                  className={`source-option ${it === source ? 'selected' : ''}`}
                >
                  <div className='row'>
                    <div className='radio-button-holder'>
                      {it === 'scryfall' ? (
                        <ScryfallIcon
                          isActive={source === 'scryfall'}
                          size={iconSize}
                        />
                      ) : (
                        <CoglibIcon
                          size={iconSize}
                          isActive={source === 'local'}
                        />
                      )}
                      <input
                        id={`source-${it}`}
                        type='radio'
                        value={it}
                        checked={it === source}
                        onChange={() => setSource(it)}
                      />
                    </div>
                    <label htmlFor={`source-${it}`}>{it}</label>
                    {it === 'local' && dbSettings}
                  </div>
                  <div>{description[it]}</div>
                </div>
              ))}
            </div>
          </fieldset>

          <div>
            <label htmlFor='sort'>sort by: </label>
            <select
              id='sort'
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
          </div>

          <div>
            <label htmlFor='dir'>sort dir: </label>
            <select
              id='dir'
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
          </div>
        </>
      )}
    </>
  )
}
