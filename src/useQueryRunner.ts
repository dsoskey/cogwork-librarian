import React, { useCallback, useRef, useState } from "react"
import * as Scry from "scryfall-sdk"
import Cards, { Card, SearchOptions, Sort } from "scryfall-sdk/out/api/Cards"
import cloneDeep from 'lodash/cloneDeep'
import { QueryReport, useReporter } from "./useReporter"
import MagicEmitter from "scryfall-sdk/out/util/MagicEmitter"
import MagicQuerier, { List, SearchError } from "scryfall-sdk/out/util/MagicQuerier"

export enum Status {
    NotStarted, Loading, Success, Error
}
export interface EnrichedCard {
    weight: number
    data: Scry.Card
    matchedQueries: string[]
}

class MyCards extends MagicQuerier {
    public searchCount(query: string, options?: SearchOptions | number) {
        let error: SearchError | undefined;
        const emitter = new MagicEmitter<number>();
    
        this.query<List<Card>>("cards/search", { q: query, ...typeof options === "number" ? { page: options } : options })
            .then(result => emitter.emit("data", Number.parseInt(result.total_cards)))
            .catch(err => error = err);

        return emitter
    }
}
const MYCARDS = new MyCards()

interface QueryRunnerProps {
    getWeight?: (index: number) => number
    injectPrefix?: (query: string) => string,
    initialQueries?: string[] | (() => string[]),
    initialOptions?: SearchOptions | (() => SearchOptions),
}

interface QueryRunner {
    execute: () => void
    queries: string[]
    setQueries: React.Dispatch<React.SetStateAction<string[]>>
    options: SearchOptions
    setOptions: React.Dispatch<React.SetStateAction<SearchOptions>>
    result: Array<EnrichedCard>
    status: Status,
    report: QueryReport,
}

export const weightAlgorithms = {
    zipf: (index: number) => 1 / (index + 2),
    uniform: (_: number) => 1,
}

export const injectors = {
    noDigital: (query: string) => `-is:digital (${query})`,
}


export const useQueryRunner = ({
    getWeight = weightAlgorithms.uniform,
    injectPrefix = injectors.noDigital,
    initialQueries = [
        'o:/sacrifice a.*:/ t:artifact',
        'o:/sacrifice a.*:/ t:creature',
        'o:/add {.}\\./'
    ],
    initialOptions = {
        order: 'cmc',
        dir: 'auto',
    },
}: QueryRunnerProps): QueryRunner => {
    const [status, setStatus] = useState(Status.NotStarted)
    const [result, setResult] = useState<Array<EnrichedCard>>([])
    const [options, setOptions] = useState<SearchOptions>(initialOptions)
    const [queries, setQueries] = useState<string[]>(initialQueries)
    const report = useReporter()
    
    const _cache = useRef<{ [query: string]: Array<EnrichedCard> }>({}) 
    const rawData = useRef<{ [query: string]: Array<EnrichedCard> }>({})
    const execute = useCallback(() => {
        setStatus(Status.Loading)
        const filteredQueries = queries.filter(q => q.length > 0)
        report.reset(filteredQueries.length)
        rawData.current = {}
        // call scryfall
        Promise.allSettled(filteredQueries
            .map((query, index) => new Promise((resolve, reject) => {
                const weight = getWeight(index)
                const _cacheKey = `${query}:${JSON.stringify(options)}`
                rawData.current[query] = []
                if (_cache.current[_cacheKey] === undefined) {
                    _cache.current[_cacheKey] = []
                    const preparedQuery = injectPrefix(query)
                    MYCARDS.searchCount(preparedQuery, options).on("data", data => {
                        report.setTotalCards(prev => prev + data)
                    })
                    Scry.Cards.search(preparedQuery, options).on("data", data => {
                        rawData.current[query].push({ data, weight, matchedQueries: [query] })
                        _cache.current[_cacheKey].push({ data, weight, matchedQueries: [query] })
                        report.addCardCount()
                    }).on("done", () => {
                        report.addComplete()
                        resolve(query)
                    }).on("error", e => {
                        report.addError()
                        reject(e)
                    })
                } else {
                    rawData.current[query] = cloneDeep(_cache.current[_cacheKey])
                    report.addCardCount(rawData.current[query].length)
                    report.addComplete()
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
            const throwErr = promiseResults.filter(it => it.status === 'rejected').length
            setStatus(throwErr ? Status.Error : Status.Success)
            setResult(sorted)
        })
    }, [queries, options, getWeight])

    return {
        execute,
        setQueries,
        queries,
        setOptions,
        options,
        result,
        status,
        report
    }
}