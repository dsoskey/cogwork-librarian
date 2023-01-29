import { cloneDeep } from 'lodash'
import React, { useState } from 'react'
import { SearchOptions, Sort, SortDirection } from 'scryfall-sdk'
import { TextEditor } from '../textEditor'
import { DataSource, DATA_SOURCE, Setter, TaskStatus } from '../../types'
import { Input } from '../input'
import { Modal } from '../modal'
import { queryExamples } from '../../api/example'

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
  execute,
  queries,
  setQueries,
  options,
  setOptions,
  source,
  setSource,
}: QueryFormProps) => {
  const [exampleOpen, setExampleOpen] = useState<boolean>(false)

  return (
    <>
      <div className='column'>
        <label>
          enter a base <ScryfallLink /> to include in each subquery
        </label>
        <Input
          value={prefix}
          onChange={(e) => {
            setPrefix(e.target.value)
          }}
          language='regex'
        />
      </div>

      <div className='column'>
        <label>
          enter one or more subqueries to combine with the base query, one
          per row
        </label>
        <TextEditor
          queries={queries}
          setQueries={setQueries}
          language='regex'
        />
      </div>

      <div className='execute'>
        <button disabled={status === 'loading'} onClick={execute}>
          scour{status === 'loading' && 'ing'} the library
        </button>

        <button onClick={() => setExampleOpen(true)}>
          browse examples
        </button>
        <Modal
          title={<h2>example queries</h2>}
          open={exampleOpen}
          onClose={() => setExampleOpen(false)}
        >
          <div className='example-content'>
            {queryExamples.map(example => (
              <div key={example.title}>
                <div className='row'>
                  <h3>{example.title}</h3>
                  <button onClick={() => {
                    setPrefix(example.prefix)
                    setQueries(example.queries)
                    setExampleOpen(false)
                  }}>use example</button>
                </div>
                <pre className='language-regex'><code>{example.prefix}</code></pre>
                <pre className='language-regex'><code>
                {example.queries.join('\n')}
              </code></pre>
              </div>
            ))}
          </div>
        </Modal>
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
