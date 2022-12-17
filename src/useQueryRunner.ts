import React, { useCallback, useRef, useState } from "react"
import * as Scry from "scryfall-sdk"
import { SearchOptions } from "scryfall-sdk/out/api/Cards"
import cloneDeep from 'lodash/cloneDeep'

export interface EnrichedCard {
    weight: number
    data: Scry.Card
    matchedQueries: string[]
}

interface QueryRunner {
    execute: () => void
    queries: string[]
    setQueries: React.Dispatch<React.SetStateAction<string[]>>
    options: SearchOptions
    setOptions: React.Dispatch<React.SetStateAction<SearchOptions>>
    result: Array<EnrichedCard>
}

export const weightAlgorithms = {
    zipf: (index: number) => 1 / (index + 2),
    uniform: (_: number) => 1,
} 

export const useQueryRunner = (
    getWeight: (index: number) => number = weightAlgorithms.uniform,
    initialQueries: string[] | (() => string[]) = [
        'o:/sacrifice a.*:/', 
        'o:/sacrifice a.*:/ t:artifact',
        'o:/sacrifice a.*:/ t:creature'
    ]
): QueryRunner => {
    const [result, setResult] = useState<Array<EnrichedCard>>([])
    const [options, setOptions] = useState<SearchOptions>({})
    const [queries, setQueries] = useState<string[]>(initialQueries)
    
    const _cache = useRef<{ [query: string]: Array<EnrichedCard> }>({}) 
    const rawData = useRef<{ [query: string]: Array<EnrichedCard> }>({})
    const execute = useCallback(() => {
        rawData.current = {}
        // call scryfall
        Promise.allSettled(queries
            .filter(q => q.length > 0)
            .map((query, index) => new Promise((resolve, reject) => {
                const weight = getWeight(index)
                rawData.current[query] = []
                if (_cache.current[query] === undefined) {
                    _cache.current[query] = []
                    Scry.Cards.search(query).on("data", data => {
                        rawData.current[query].push({ data, weight, matchedQueries: [query] })
                        _cache.current[query].push({ data, weight, matchedQueries: [query] })
                    }).on("done", () => {
                        console.log("Done")
                        resolve(query)
                    }).on("error", e => {
                        console.log(`Error: ${JSON.stringify(e)}`)
                        reject(e)
                    })
                } else {
                    rawData.current[query] = cloneDeep(_cache.current[query])
                    resolve(query)
                }
            })    
        )).then(promiseResults => {
            const orgo: { [id: string]: EnrichedCard } = {}

            Object.values(rawData.current).forEach(q => {
                q.forEach(card => {
                    const maybeCard = orgo[card.data.id]
                    if (maybeCard !== undefined) {
                        maybeCard.weight += card.weight
                        maybeCard.matchedQueries.push(...card.matchedQueries)
                    } else {
                        orgo[card.data.id] = card
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
        setOptions,
        options,
        result,
    }
}