import React, { useState } from 'react'
import { Sort, SortDirection, UniqueStrategy } from 'scryfall-sdk'
import { DnDInput } from './dndInput'
import { Results } from './results'
import { QueryTextEditor } from './textAreaInput'
import { useQueryRunner, weightAlgorithms } from './useQueryRunner'
import cloneDeep from 'lodash/cloneDeep'
import { Expander } from './expander'

export const App = () => {
    const [inputIsTextArea, setInputIsTextArea] = useState(true)
    const { execute,
        queries, setQueries,
        options, setOptions,
        status, result,
    } = useQueryRunner(weightAlgorithms.zipf)

    return (
        <div className="root">
            <div className="editor">
                <h1>cogwork librarian</h1>

                <label>enter one scryfall query per row</label>

                {inputIsTextArea ? 
                    <QueryTextEditor queries={queries} setQueries={setQueries} /> : 
                    <DnDInput queries={queries} setQueries={setQueries} />
                }

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

                    <button onClick={() => setInputIsTextArea((prev) => !prev)}>
                        switch to {inputIsTextArea ? "drag and drop" : "query editor"}
                    </button>
                </Expander>
                    
                <div>
                    <button onClick={execute}>scour the library</button>
                </div>
            </div>

            <Results result={result} status={status} />
        </div>
    )
}