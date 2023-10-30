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
import { SearchOptions } from '../memory/types/searchOptions'
import { QueryRunner } from '../memory/queryRunner'
import { useMemo } from 'react'
import { MemoryFilterProvider } from '../memory/filters'

interface MemoryQueryRunnerProps extends QueryRunnerProps {
  corpus: NormedCard[]
  cubes: { [cubeId: string]: Set<string> }
  otags: { [otag: string]: Set<string> }
  atags: { [atag: string]: Set<string> }
}
export const useMemoryQueryRunner = ({
  getWeight = weightAlgorithms.uniform,
  injectPrefix,
  corpus,
  cubes, atags, otags
}: MemoryQueryRunnerProps): CoglibQueryRunner => {
  const { status, report, result, rawData, execute, errors } =
    useQueryCoordinator()
  const searchCards = useMemo(
    () => {
      const filters = new MemoryFilterProvider({ cubes, otags, atags });
      return QueryRunner.generateSearchFunction(corpus, filters)
    },
    [corpus, cubes, atags, otags]
  )

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
