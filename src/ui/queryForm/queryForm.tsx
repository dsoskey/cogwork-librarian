import { cloneDeep } from 'lodash'
import React from 'react'
import { SearchOptions, Sort, SortDirection } from 'scryfall-sdk'
import { TextEditor } from '../textEditor'
import { DataSource, DATA_SOURCE, Setter, TaskStatus } from '../../types'
import { Input } from '../input'
import { AppInfo } from '../appInfo'
import { ExampleGallery } from './exampleGallery'

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
}: QueryFormProps) => {
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

      <h2>search options</h2>
      <fieldset>
        <legend>data source:</legend>
        {Object.keys(DATA_SOURCE).map((it: DataSource) => (
          <div key={it}>
            <input
              id={`source-${it}`}
              type='radio'
              value={it}
              checked={it === source}
              onChange={() => setSource(it)}
            />
            <label htmlFor={`source-${it}`}>
              {it} - {description[it]}
            </label>
          </div>
        ))}
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
  )
}
