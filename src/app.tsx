import React, { useState } from 'react'
import { DnDInput } from './dndInput'
import { Results } from './results'
import { QueryTextEditor } from './textAreaInput'
import { useQueryRunner, weightAlgorithms } from './useQueryRunner'

export const App = () => {
    
    const [inputIsTextArea, setInputIsTextArea] = useState(true)
    const { execute, setQueries, queries, result } = useQueryRunner(weightAlgorithms.zipf)

    return (
        <div className="root">
            <div className="editor">
                <h1>cogwork librarian</h1>

                <label>enter one scryfall query per row</label>

                {inputIsTextArea ? 
                    <QueryTextEditor queries={queries} setQueries={setQueries} /> : 
                    <DnDInput queries={queries} setQueries={setQueries} />
                }

                <div>
                    <button onClick={execute}>run</button>
                    <button onClick={() => setInputIsTextArea((prev) => !prev)}>
                        switch to {inputIsTextArea ? "drag and drop" : "query editor"}
                    </button>
                </div>
                
            </div>
            <Results result={result} />            
        </div>
    )
}