import { useCallback } from "react"
import { Card, SearchOptions } from "scryfall-sdk/out/api/Cards"
import cloneDeep from 'lodash/cloneDeep'
import { queryParser } from './parser'
import { QueryRunner, QueryRunnerProps, injectors, weightAlgorithms } from "../queryRunnerCommon"
import { sortBy } from "lodash";
import { Sort } from "scryfall-sdk";
import { parsePowTou } from "./filter";
import { useQueryCoordinator } from "../useQueryCoordinator";

const sortFunc = (key: keyof typeof Sort): any => {
    switch (key) {
        case "name":
        case "set":
        case "released":
        case "rarity":
        case "color":
        case "artist":
            return key
        case "usd":
        case "tix":
        case "eur":
        case "cmc":
        case "power":
        case "toughness":
        case "edhrec":
            return (card: Card) => parsePowTou(card[key])
    }
}

interface MemoryQueryRunnerProps extends QueryRunnerProps {
    corpus: Card[]
}
export const useMemoryQueryRunner = ({
    getWeight = weightAlgorithms.uniform,
    injectPrefix = injectors.noToken,
    corpus
}: MemoryQueryRunnerProps): QueryRunner => {
    const {
        status, report, cache, result, rawData, execute,
    } = useQueryCoordinator()

    const getCards = useCallback((query: string, options: SearchOptions) => {
        const preparedQuery = injectPrefix(query)
        const parser = queryParser()
        parser.feed(preparedQuery)
        console.debug(`parsed ${parser.results}`)
        const filtered = corpus.filter(parser.results[0])
        const sorted = sortBy(filtered, [sortFunc(options.order), "name"])
        if (options.dir === 'auto') {
            switch (options.order) {
                case "usd":
                case "tix":
                case "eur":
                case "edhrec":
                    sorted.reverse()
                    break;
                case "released":
                default:
                    break;
            }
        } else if (options.dir === 'desc') {
            sorted.reverse()
        }
        return sorted
    }, [corpus])

    const runQuery = async (query: string, index: number, options: SearchOptions) => {
        const weight = getWeight(index)
        const _cacheKey = `${query}:${JSON.stringify(options)}`
        rawData.current[query] = []
        if (cache.current[_cacheKey] === undefined) {
            cache.current[_cacheKey] = []
            try {
                const cards = getCards(query, options)
                    .map((card: Card) => ({
                        data: card,
                        weight,
                        matchedQueries: [query]
                    }))
                rawData.current[query] = cloneDeep(cards)
                cache.current[_cacheKey] = cards
                report.addCardCount(cards.length)
                report.addComplete()
                return query
            } catch (error) {
                console.log(error)
                report.addError()
                throw error
            }
        } else {
            rawData.current[query] = cloneDeep(cache.current[_cacheKey])
            report.addCardCount(rawData.current[query].length)
            report.addComplete()
            return query
        }
    }

    return {
        run: execute(runQuery),
        result,
        status,
        report
    }
}