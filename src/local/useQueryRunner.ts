import { useCallback, useRef, useState } from "react"
import { Card, SearchOptions } from "scryfall-sdk/out/api/Cards"
import cloneDeep from 'lodash/cloneDeep'
import { useReporter } from "../useReporter"
import { TaskStatus } from "../types"
import { queryParser } from './parser'
import { CardCollection } from "./filter"
import { EnrichedCard, injectors, QueryRunner, QueryRunnerProps, weightAlgorithms } from "../queryRunnerCommon"

export const useQueryRunner = ({
    getWeight = weightAlgorithms.uniform,
    injectPrefix = injectors.noDigital,
}: QueryRunnerProps): QueryRunner => {
    const [status, setStatus] = useState<TaskStatus>('unstarted')
    const [result, setResult] = useState<Array<EnrichedCard>>([])
    const report = useReporter()
    
    const _cache = useRef<{ [query: string]: Array<EnrichedCard> }>({}) 
    const rawData = useRef<{ [query: string]: Array<EnrichedCard> }>({})
    const execute = useCallback((queries: string[], options: SearchOptions) => {
        setStatus('loading')
        const filteredQueries = queries.filter(q => q.length > 0)
        report.reset(filteredQueries.length)
        rawData.current = {}
        // call scryfall
        Promise.allSettled(filteredQueries
            .map(async (query, index) => {
                const weight = getWeight(index)
                const _cacheKey = `${query}:${JSON.stringify(options)}`
                rawData.current[query] = []
                if (_cache.current[_cacheKey] === undefined) {
                    _cache.current[_cacheKey] = []
                    // TODO: add prepared query

                    try {
                        const parser = queryParser()
                        parser.feed(query)
                        console.log(`parsed ${parser.results}`)
                        // if (parser.results.length  1) {
                        const cards = (await (parser.results[0] as CardCollection)
                            .sortBy(options.order))
                            .map((card: Card) => ({
                                data: Card.construct(card),
                                weight,
                                matchedQueries: [query]
                            }))
                        rawData.current[query] = cloneDeep(cards)
                        _cache.current[_cacheKey] = cards
                        report.addCardCount(cards.length)
                        report.addComplete()
                        // }
                        return query
                    } catch (error) {
                        report.addError()
                        throw error
                    }
                } else {
                    rawData.current[query] = cloneDeep(_cache.current[_cacheKey])
                    report.addCardCount(rawData.current[query].length)
                    report.addComplete()
                    return query
                }
            }  
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
            const throwErr = promiseResults.filter(it => it.status === 'rejected').length
            setStatus(throwErr ? 'error' : 'success')
            report.markTimepoint('end')
            setResult(sorted)
        })
    }, [getWeight])

    return {
        execute,
        result,
        status,
        report
    }
}