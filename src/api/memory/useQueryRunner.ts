import { Card, SearchOptions } from 'scryfall-sdk/out/api/Cards'
import cloneDeep from 'lodash/cloneDeep'
import { printingParser, queryParser } from './parser'
import {
  QueryRunner,
  QueryRunnerFunc,
  QueryRunnerProps,
  weightAlgorithms,
} from '../queryRunnerCommon'
import { sortBy } from 'lodash'
import { useQueryCoordinator } from '../useQueryCoordinator'
import { chooseFilterFunc, NormedCard } from '../local/normedCard'
import { err, errAsync, ok, okAsync, Result } from 'neverthrow'
import { CogError, displayMessage, NearlyError } from '../../error'
import { FilterRes } from './filterBase'
import { useContext } from 'react'
import { FlagContext } from '../../flags'
import { SortOrder, sortFunc } from '../card/sort'

const getOrder = (filtersUsed: string[], options: SearchOptions): SortOrder => {
  const sortFilter = filtersUsed.find(it => it.startsWith('order:'))
  if (sortFilter !== undefined) {
    return sortFilter.replace('order:', '') as SortOrder
  }
  return options.order
}

const getDirection = (filtersUsed: string[], options: SearchOptions) => {
  const dirFilter = filtersUsed.find(it => it.startsWith('direction:'))
  if (dirFilter !== undefined) {
    return dirFilter.replace("direction:", "")
  }
  return options.dir ?? 'auto'
}

interface MemoryQueryRunnerProps extends QueryRunnerProps {
  corpus: NormedCard[]
}
export const useMemoryQueryRunner = ({
  getWeight = weightAlgorithms.uniform,
  injectPrefix,
  corpus,
}: MemoryQueryRunnerProps): QueryRunner => {
  const { status, report, cache, result, rawData, execute, errors } =
    useQueryCoordinator()
  const { disableCache } = useContext(FlagContext).flags

  const getCards = (
    query: string,
    index: number,
    options: SearchOptions
  ): Result<Card[], CogError> => {
    // parse query
    const parser = queryParser()
    try {
      console.debug(`feeding ${query}`)
      parser.feed(query)
      console.debug(`parsed`)
      console.debug(parser.results)
      if (parser.results.length > 1) {
        const uniqueParses = new Set<string>(
          parser.results.map((it) => {
            return it.filtersUsed.toString()
          })
        )
        if (uniqueParses.size > 1) {
          console.warn('ambiguous parse!')
        }
      }
    } catch (error) {
      const { message } = error as NearlyError
      const isNearlyError = error.offset !== undefined
      console.debug(message)
      return err({
        query,
        debugMessage: message,
        displayMessage: isNearlyError ? displayMessage(query, index, error) : message,
      })
    }

    // filter normedCards
    const { filterFunc, filtersUsed } = parser
      .results[0] as FilterRes<NormedCard>
    const filtered = []
    for (const card of corpus) {
      if (filterFunc(card)) {
        filtered.push(card)
      }
    }

    // parse print logic
    const printParser = printingParser()
    try {
      console.debug(`feeding ${query} to print parser`)
      printParser.feed(query)
    } catch (error) {
      const { message } = error as NearlyError
      return err({
        query,
        debugMessage: message,
        displayMessage: displayMessage(query, index, error),
      })
    }
    const printFilterFunc = chooseFilterFunc(filtersUsed)

    // filter prints
    const printFiltered: Card[] = filtered
      .flatMap(printFilterFunc(printParser.results[0].filterFunc))
      .filter(it => it !== undefined)

    // sort
    const order: SortOrder = getOrder(filtersUsed, options)
    const sorted = sortBy(printFiltered, [...sortFunc(order), 'name']) as Card[]

    // direction
    const direction = getDirection(filtersUsed, options)
    if (direction === 'auto') {
      switch (order) {
        case 'rarity':
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
    } else if (direction === 'desc') {
      sorted.reverse()
    }

    return ok(sorted)
  }

  const runQuery: QueryRunnerFunc = (
    query: string,
    index: number,
    options: SearchOptions
  ) => {
    if (corpus.length === 0) {
      console.warn(`ran query against an empty corpus: ${query}`)
      return
    }
    const weight = getWeight(index)
    const preparedQuery = injectPrefix(query)
    const _cacheKey = `${preparedQuery}:${JSON.stringify(options)}`
    rawData.current[preparedQuery] = []
    if (cache.current[_cacheKey] === undefined || disableCache) {
      // TODO: remove try catch when getCards no longer can throw
      try {
        const cardResult = getCards(preparedQuery, index, options)
        if (cardResult.isErr()) {
          report.addError()
          return errAsync(cardResult.error)
        }

        // This smells. should the cache manage its own disability?
        if (!disableCache) {
          cache.current[_cacheKey] = []
        }
        const cards = cardResult.value.map((card: Card) => ({
          data: card,
          weight,
          matchedQueries: [query],
        }))
        rawData.current[preparedQuery] = cloneDeep(cards)
        if (!disableCache) {
          cache.current[_cacheKey] = cards
        }
        report.addCardCount(cards.length)
        report.addComplete()
      } catch (error) {
        console.log(error)
        report.addError()
        return errAsync({
          query: preparedQuery,
          displayMessage: error.toLocaleString(),
          debugMessage: error.toLocaleString(),
        })
      }
    } else {
      rawData.current[preparedQuery] = cloneDeep(cache.current[_cacheKey])
      report.addCardCount(rawData.current[preparedQuery].length)
      report.addComplete()
    }
    return okAsync(preparedQuery)
  }

  return {
    run: execute(runQuery),
    result,
    status,
    report,
    errors,
  }
}
