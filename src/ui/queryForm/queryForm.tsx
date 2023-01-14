import { cloneDeep } from 'lodash'
import React from 'react'
import { SearchOptions, Sort, SortDirection } from 'scryfall-sdk'
import { Expander } from '../expander'
import { TextEditor } from '../textEditor'
import { DataSource, DATA_SOURCE, Setter, TaskStatus } from '../../types'

const description: Record<DataSource, String> = {
    scryfall: 'fetches from scryfall using its API. the current recommended experience',
    local: 'WARNING: ALPHA! Syntax is under active development! processes queries against a local database of oracle cards'
}

export interface QueryFormProps {
    status: TaskStatus
    execute: () => void
    queries: string[]
    setQueries: Setter<string[]>
    options: SearchOptions
    setOptions: Setter<SearchOptions>
    source: DataSource
    setSource: Setter<DataSource>
}

export const QueryForm = ({
    status, execute,
    queries, setQueries,
    options, setOptions,
    source, setSource,
}: QueryFormProps) => {

    return <>
        <div><label>
            enter one
            {" "}
            <a href="https://scryfall.com/docs/syntax" rel="noreferrer" target="_blank">scryfall query</a>
            {" "}
            per row
        </label></div>

        <TextEditor
            queries={queries}
            setQueries={setQueries}
            language='regex'
        />

        <div className='execute'>
            <button disabled={status==="loading"} onClick={execute}>
                scour{status === "loading" && "ing"} the library
            </button>
        </div>

        <Expander title="search options">
            <fieldset>
                <legend>data source: </legend>
                {Object.keys(DATA_SOURCE)
                    .map(((it: DataSource) => <div key={it}>
                        <input id={`source-${it}`}
                            type='radio'
                            value={it}
                            checked={it === source}
                            onClick={() => setSource(it)}
                        />
                        <label htmlFor={`source-${it}`}>{it} - {description[it]}</label>
                    </div>))}
            </fieldset>

            <div>
                <label htmlFor="sort">sort by: </label>
                <select id="sort" value={options.order} onChange={event => {
                    setOptions(prev => {
                        const newVal = cloneDeep(prev)
                        newVal.order = event.target.value as keyof typeof Sort
                        return newVal 
                    })
                }}>
                    <option value={null} />
                    {Object.keys(Sort)
                    .filter(it => Number.isNaN(Number.parseInt(it)))
                    .map((it => <option key={it} value={it}>{it}</option>))}
                </select>
            </div>

            <div>
                <label htmlFor="dir">sort dir: </label>
                <select id="dir" value={options.dir} onChange={event => {
                    setOptions(prev => {
                        const newVal = cloneDeep(prev)
                        newVal.dir = event.target.value as keyof typeof SortDirection
                        return newVal 
                    })
                }}>
                    <option value={null} />
                    {Object.keys(SortDirection)
                    .filter(it => Number.isNaN(Number.parseInt(it)))
                    .map((it => <option key={it} value={it}>{it}</option>))}
                </select>
            </div>
        </Expander>
    </>
}