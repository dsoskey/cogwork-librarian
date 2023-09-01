import { Card } from 'scryfall-sdk/out/api/Cards'
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
  const { status, report, result, rawData, execute, errors } =
    useQueryCoordinator()
  const searchCards = QueryRunner.generateSearchFunction(corpus)

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
    try {
      const cardResult = searchCards(preparedQuery, options)
      if (cardResult.isErr()) {
        report.addError()
        const { query, errorOffset, message } = cardResult.error
        return errAsync({
          query,
          debugMessage: message,
          displayMessage: displayMessage(query, index, errorOffset),
        })
      }
      const cards = cardResult.value.map((card: Card) => ({
        data: card,
        weight,
        matchedQueries: [query],
      }))
      rawData.current[preparedQuery] = cards
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
