import { useCallback } from 'react'
import { Card, SearchOptions } from 'scryfall-sdk/out/api/Cards'
import cloneDeep from 'lodash/cloneDeep'
import { queryParser } from './parser'
import {
  QueryRunner,
  QueryRunnerProps,
  weightAlgorithms,
} from '../queryRunnerCommon'
import { sortBy } from 'lodash'
import { Sort } from 'scryfall-sdk'
import { parsePowTou } from './filter'
import { useQueryCoordinator } from '../useQueryCoordinator'
import { NormedCard, pickPrinting } from '../local/normedCard'

const sortFunc = (key: keyof typeof Sort): any => {
  switch (key) {
    case 'name':
    case 'set':
    case 'released':
    case 'rarity':
    case 'color':
    case 'artist':
      return key
    case 'usd':
    case 'tix':
    case 'eur':
    case 'cmc':
    case 'edhrec':
      return (card: Card) => Number.parseFloat(card[key] ?? 0)
    case 'power':
    case 'toughness':
      return (card: Card) => parsePowTou(card[key])
  }
}

interface MemoryQueryRunnerProps extends QueryRunnerProps {
  corpus: NormedCard[]
}
export const useMemoryQueryRunner = ({
  getWeight = weightAlgorithms.uniform,
  injectPrefix,
  corpus,
}: MemoryQueryRunnerProps): QueryRunner => {
  const { status, report, cache, result, rawData, execute } =
    useQueryCoordinator()

  const getCards = useCallback(
    (query: string, options: SearchOptions) => {
      const parser = queryParser()
      parser.feed(query)
      console.debug(`parsed ${parser.results}`)
      const filtered = corpus.filter(parser.results[0])
      const sorted = sortBy(filtered, [sortFunc(options.order), 'name'])
      if (options.dir === 'auto') {
        switch (options.order) {
          case 'usd':
          case 'tix':
          case 'eur':
          case 'edhrec':
            sorted.reverse()
            break
          case 'released':
          default:
            break
        }
      } else if (options.dir === 'desc') {
        sorted.reverse()
      }
      return sorted.flatMap(pickPrinting)
    },
    [corpus]
  )

  const runQuery = async (
    query: string,
    index: number,
    options: SearchOptions
  ) => {
    const weight = getWeight(index)
    const preparedQuery = injectPrefix(query)
    const _cacheKey = `${preparedQuery}:${JSON.stringify(options)}`
    rawData.current[preparedQuery] = []
    if (cache.current[_cacheKey] === undefined) {
      cache.current[_cacheKey] = []
      try {
        const cards = getCards(preparedQuery, options).map((card: Card) => ({
          data: card,
          weight,
          matchedQueries: [query],
        }))
        rawData.current[preparedQuery] = cloneDeep(cards)
        cache.current[_cacheKey] = cards
        report.addCardCount(cards.length)
        report.addComplete()
        return preparedQuery
      } catch (error) {
        console.log(error)
        report.addError()
        throw error
      }
    } else {
      rawData.current[preparedQuery] = cloneDeep(cache.current[_cacheKey])
      report.addCardCount(rawData.current[preparedQuery].length)
      report.addComplete()
      return preparedQuery
    }
  }

  return {
    run: execute(runQuery),
    result,
    status,
    report,
  }
}
