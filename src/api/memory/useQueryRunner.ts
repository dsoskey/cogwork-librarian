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
import { Sort } from 'scryfall-sdk'
import { parsePowTou } from './oracleFilter'
import { useQueryCoordinator } from '../useQueryCoordinator'
import { allPrintings, findPrinting, NormedCard } from '../local/normedCard'
import { err, errAsync, ok, okAsync, Result } from 'neverthrow'
import { CogError, displayMessage, NearlyError } from '../../error'
import { FilterRes } from './filterBase'
import { showAllFilter } from './printFilter'

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
  const { status, report, cache, result, rawData, execute, errors } =
    useQueryCoordinator()

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
    const filtered = corpus.filter(filterFunc)

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
    const printFilterFunc = filtersUsed
      .filter((it) => showAllFilter.has(it)).length
      ? allPrintings
      : findPrinting

    // filter prints
    const printFiltered: Card[] = filtered
      .flatMap(printFilterFunc(printParser.results[0].filterFunc))
      .filter(it => it !== undefined)

    // sort
    const sorted = sortBy(printFiltered, [sortFunc(options.order), 'name']) as Card[]
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

    return ok(sorted)
  }

  const runQuery: QueryRunnerFunc = (
    query: string,
    index: number,
    options: SearchOptions
  ) => {
    const weight = getWeight(index)
    const preparedQuery = injectPrefix(query)
    const _cacheKey = `${preparedQuery}:${JSON.stringify(options)}`
    rawData.current[preparedQuery] = []
    if (cache.current[_cacheKey] === undefined) {
      // TODO: remove try catch when getCards no longer can throw
      try {
        const cardResult = getCards(preparedQuery, index, options)
        if (cardResult.isErr()) {
          report.addError()
          return errAsync(cardResult.error)
        }

        cache.current[_cacheKey] = []
        const cards = cardResult.value.map((card: Card) => ({
          data: card,
          weight,
          matchedQueries: [query],
        }))
        rawData.current[preparedQuery] = cloneDeep(cards)
        cache.current[_cacheKey] = cards
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
