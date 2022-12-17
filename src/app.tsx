import React from 'react'
import { EnrichedCard, useQueryRunner } from './useQueryRunner'
import cloneDeep from 'lodash/cloneDeep'

interface CardViewProps {
    card: EnrichedCard
}

export const CardView = ({ card }: CardViewProps) => {

    return (<div>
        <div>{card.data.name}</div>
        <div>weight: {card.weight}</div>
        <div>matched queries: {card.matchedQueries}</div>
    </div>)
}

export const App = () => {
    const { execute, setQueries, queries, result } = useQueryRunner()

    return (
        <div>
            <h1>cogwork librarian</h1>

            <label>enter your queries</label>

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

            <div>
                <button onClick={() => {
                    setQueries((prev) => {
                        const newQ = cloneDeep(prev)
                        newQ.push("")
                        return newQ
                    })
                }}>add query</button>

                <button onClick={execute}>run</button>
            </div>

            {result.length > 0 && <div>
                <h2>results ({result.length})</h2>
                {result.map(card => <CardView key={card.data.name} card={card} />)}
            </div>}
        </div>
    )
}