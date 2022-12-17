import React, { useState } from 'react'
import { DnDInput } from './dndInput'
import { Results } from './results'
import { QueryTextEditor } from './textAreaInput'
import { useQueryRunner, weightAlgorithms } from './useQueryRunner'

export const App = () => {
    
    const [inputIsTextArea, setInputIsTextArea] = useState(true)
    const { execute, setQueries, queries, result } = useQueryRunner(weightAlgorithms.zipf)

    return (
        <div>
            <h1>cogwork librarian</h1>

            <label>enter your queries</label>

            <div className='result-container'>
                {inputIsTextArea ? 
                    <QueryTextEditor queries={queries} setQueries={setQueries} /> : 
                    <DnDInput queries={queries} setQueries={setQueries} />
                }
            </div>
            
            <button onClick={execute}>run</button>
            <button onClick={() => setInputIsTextArea((prev) => !prev)}>
                switch to {inputIsTextArea ? "drag and drop" : "query editor"}
            </button>

            <Results result={result} />            
        </div>
    )
}