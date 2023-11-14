import { Card } from 'scryfall-sdk'
import {
  QueryRunner as CoglibQueryRunner,
  QueryRunnerFunc,
  QueryRunnerProps,
  weightAlgorithms,
} from '../queryRunnerCommon'
import { useQueryCoordinator } from '../useQueryCoordinator'
import { NormedCard } from '../memory/types/normedCard'
import { displayMessage } from '../../error'
import { SearchOptions } from '../memory/types/searchOptions'
import { QueryRunner } from '../memory/queryRunner'
import { useMemo } from 'react'
import { CachingFilterProvider } from '../memory/filters'
import { cogDB } from './db'

interface MemoryQueryRunnerProps extends QueryRunnerProps {
  corpus: NormedCard[]
}
export const useMemoryQueryRunner = ({
  getWeight = weightAlgorithms.uniform,
  injectPrefix,
  corpus,
}: MemoryQueryRunnerProps): CoglibQueryRunner => {
  const { status, report, result, rawData, execute, errors } =
    useQueryCoordinator()
  const searchCards = useMemo(() => {
    const filters = new CachingFilterProvider(cogDB);
    return QueryRunner.generateSearchFunction(corpus, filters)
  }, [corpus])

  const runQuery: QueryRunnerFunc = (
    query: string,
    index: number,
    options: SearchOptions,
    injectPrefixx?: (query: string) => string,
    getWeightt?: (index: number) => number
  ) => {
    if (corpus.length === 0) {
      console.warn(`ran query against an empty corpus: ${query}`)
      return
    }
    const weight = getWeightt ? getWeightt(index) : getWeight(index)
    const preparedQuery = injectPrefixx ? injectPrefixx(query) : injectPrefix(query)
    rawData.current[preparedQuery] = []
    return searchCards(preparedQuery, options)
      .map(cardResult => {
        const cards = cardResult.map((card: Card) => ({
          data: card,
          weight,
          matchedQueries: [query],
        }))
        rawData.current[preparedQuery] = cards
        report.addCardCount(cards.length)
        report.addComplete()
        return preparedQuery;
      })
      .mapErr(error => {
        report.addError()
        const { query, errorOffset, message } = error
        // better error handling is coming, i swear
        return {
          query,
          debugMessage: message,
          displayMessage: displayMessage(query, index, errorOffset) + "\n" + message,
        }
      })
  }

  return {
    run: execute(runQuery),
    result,
    status,
    report,
    errors,
  }
}
