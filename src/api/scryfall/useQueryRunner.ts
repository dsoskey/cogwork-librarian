import { useCallback, useRef, useState } from "react"
import * as Scry from "scryfall-sdk"
import { Card, SearchOptions } from "scryfall-sdk"
import cloneDeep from 'lodash/cloneDeep'
import { useReporter } from "../useReporter"
import MagicEmitter from "scryfall-sdk/out/util/MagicEmitter"
import MagicQuerier, { List, SearchError } from "scryfall-sdk/out/util/MagicQuerier"
import { TaskStatus } from "../../types"
import { EnrichedCard, injectors, QueryRunner, QueryRunnerProps, weightAlgorithms } from "../queryRunnerCommon"

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

export const useScryfallQueryRunner = ({
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