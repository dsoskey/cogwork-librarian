import { cloneDeep } from 'lodash'
import React from 'react'
import { SearchOptions, Sort, SortDirection } from 'scryfall-sdk'
import { Expander } from './expander'
import { TextEditor } from './textEditor'

export interface QueryFormProps {
    execute: () => void
    queries: string[]
    setQueries: React.Dispatch<React.SetStateAction<string[]>>
    options: SearchOptions
    setOptions: React.Dispatch<React.SetStateAction<SearchOptions>>
}

export const QueryForm = ({
    execute, queries, setQueries, options, setOptions
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