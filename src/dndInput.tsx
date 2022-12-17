import cloneDeep from 'lodash/cloneDeep'
import React from 'react'

export interface QueryInputProps {
    setQueries: React.Dispatch<React.SetStateAction<string[]>>
    queries: string[]
}

export const DnDInput = ({ setQueries, queries }: QueryInputProps) => {
    return <div>
        {queries.map((query, index) => <div key={index}>
            <input value={query} onChange={(event) => setQueries((prev) => {
                const newQ = cloneDeep(prev)
                newQ[index] = event.target.value
                return newQ
            })} />
            <button onClick={() => {
                setQueries((prev) => {
                    const newQ = cloneDeep(prev)
                    newQ.splice(index, 1)
                    return newQ
                })
            }}>remove query</button>
        </div>)}
        <button onClick={() => {
                setQueries((prev) => {
                    const newQ = cloneDeep(prev)
                    newQ.push("")
                    return newQ
                })
        }}>add query</button>
    </div>
}