import React, { useCallback, useRef, useState } from "react"
import * as Scry from "scryfall-sdk"

export interface EnrichedCard {
    weight: number
    data: Scry.Card
    matchedQueries: string[]
}

interface QueryRunner {
    execute: () => void
    setQueries: React.SetStateAction<string[]>
    queries: string[]
    result: Array<EnrichedCard>
}


export const weightAlgorithms = {
    zipf: (index: number) => 1 / (index + 2),
    uniform: (_: number) => 1,
} 

export const useQueryRunner = (
    getWeight: (index: number) => number = weightAlgorithms.uniform
): QueryRunner => {
    const [queries, setQueries] = useState<string[]>([""])
    const [result, setResult] = useState<Array<EnrichedCard>>([])
    
    const rawData = useRef<{ [query: string]: Array<EnrichedCard> }>({})
    const execute = useCallback(() => {
        // call scryfall
        Promise.allSettled(queries.map((query, index) => {
            return new Promise((resolve, reject) => {
                rawData.current[query] = []
                const weight = getWeight(index)
                Scry.Cards.search(query).on("data", data => {
                    rawData.current[query].push({ data, weight, matchedQueries: [query] })
                }).on("done", duh => {
                    console.log(duh)
                    resolve(query)
                }).on("error", e => {
                    console.log(e)
                    reject(e)
                })
            })
            
        })).then(promiseResults => {
            const orgo: { [name: string]: EnrichedCard } = {}

            Object.values(rawData.current).forEach(q => {
                q.forEach(card => {
                    const maybeCard = orgo[card.data.name]
                    if (maybeCard !== undefined) {
                        maybeCard.weight += card.weight
                        maybeCard.matchedQueries.push(...card.matchedQueries)
                    } else {
                        orgo[card.data.name] = card
                    }
                })
            })

            const sorted: Array<EnrichedCard> = Object.values(orgo).sort((a, b) => b.weight - a.weight)
            setResult(sorted)
        })
    }, [queries, getWeight])

    return {
        execute,
        setQueries,
        queries,
        result,
    }
}