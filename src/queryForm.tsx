import { cloneDeep } from 'lodash'
import React from 'react'
import { SearchOptions, Sort, SortDirection } from 'scryfall-sdk'
import { Expander } from './expander'
import { TextEditor } from './textEditor'
import { DataSource, DATA_SOURCE, Setter } from './types'

export interface QueryFormProps {
    execute: () => void
    queries: string[]
    setQueries: Setter<string[]>
    options: SearchOptions
    setOptions: Setter<SearchOptions>
    source: DataSource
    setSource: Setter<DataSource>
}

export const QueryForm = ({
    execute, queries, setQueries, options, setOptions, source, setSource,
}: QueryFormProps) => {
    
    return <>
        <label>enter one scryfall query per row</label>

        <TextEditor
            queries={queries}
            setQueries={setQueries}
            language='regex'
        />

        <div className='execute'>
            <button onClick={execute}>scour the library</button>
        </div>

        <Expander title="search options">
            <div>
                <label htmlFor="source">data source: </label>
                <select id="source" value={source} onChange={event => {
                    setSource(event.target.value as DataSource)
                }}>
                    {Object.keys(DATA_SOURCE)
                    .map((it => <option key={it} value={it}>{it}</option>))}
                </select>
            </div>

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