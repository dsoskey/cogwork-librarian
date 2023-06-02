import { Card } from 'scryfall-sdk/out/api/Cards'
import cloneDeep from 'lodash/cloneDeep'
import {
  QueryRunner as CoglibQueryRunner,
  QueryRunnerFunc,
  QueryRunnerProps,
  weightAlgorithms,
} from '../queryRunnerCommon'
import { useQueryCoordinator } from '../useQueryCoordinator'
import { NormedCard } from '../memory/types/normedCard'
import { errAsync, okAsync } from 'neverthrow'
import { displayMessage } from '../../error'
import { useContext } from 'react'
import { FlagContext } from '../../flags'
import { QueryRunner } from '../memory/queryRunner'
import { SearchOptions } from '../memory/types/searchOptions'

interface MemoryQueryRunnerProps extends QueryRunnerProps {
  corpus: NormedCard[]
}
export const useMemoryQueryRunner = ({
  getWeight = weightAlgorithms.uniform,
  injectPrefix,
  corpus,
}: MemoryQueryRunnerProps): CoglibQueryRunner => {
  const { status, report, cache, result, rawData, execute, errors } =
    useQueryCoordinator()
  const { disableCache } = useContext(FlagContext).flags
  const getCards = QueryRunner.generateSearchFunction(corpus)

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
      try {
        const cardResult = getCards(preparedQuery, options)
        if (cardResult.isErr()) {
          report.addError()
          const { query, errorOffset, message } = cardResult.error
          return errAsync({
            query,
            debugMessage: message,
            displayMessage: displayMessage(query, index, errorOffset),
          })
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
