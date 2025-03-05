import {
  EnrichedCard,
  injectPrefix,
  QueryRunner as CoglibQueryRunner,
  QueryRunnerFunc,
  QueryRunnerProps,
  RunStrategy,
} from '../queryRunnerCommon'
import { useQueryCoordinator } from '../useQueryCoordinator'
import { displayMessage } from '../../error'
import { Card, NormedCard, SearchOptions, QueryRunner } from 'mtgql'
import { useMemo, useState } from 'react'
import { COGDB_FILTER_PROVIDER } from './db'

interface MemoryQueryRunnerProps extends QueryRunnerProps {
  corpus: NormedCard[]
}
export const useMemoryQueryRunner = ({ corpus }: MemoryQueryRunnerProps): CoglibQueryRunner => {
  const { status, report, result, reset, rawData, execute, aggregateVenn, errors } =
    useQueryCoordinator()
  const [runStrategy, setRunStrategy] = useState<RunStrategy>(RunStrategy.Search)
  const searchCards = useMemo(() => {
    return QueryRunner.generateSearchFunction(corpus, COGDB_FILTER_PROVIDER)
  }, [corpus])
  const generateVennDiagram = useMemo(() => {
    return QueryRunner.generateVennDiagram(corpus, COGDB_FILTER_PROVIDER)
  }, [corpus])

  const runQuery: QueryRunnerFunc = async (
    query: string,
    index: number,
    options: SearchOptions,
    injectPrefix: (query: string) => string,
    getWeight: (index: number) => number
  ) => {
    if (corpus.length === 0) {
      console.warn(`ran query against an empty corpus: ${query}`)
      return
    }
    setRunStrategy(RunStrategy.Search)
    const weight = getWeight(index)
    const preparedQuery = injectPrefix(query)
    rawData.current[preparedQuery] = []
    try {
      const cardResult = await searchCards(preparedQuery, options)
      const cards: EnrichedCard[] = cardResult.map((card: Card) => ({
        data: card,
        weight,
        matchedQueries: [query],
      }))
      rawData.current[preparedQuery] = cards
      report.addCardCount(cards.length)
      report.addComplete()
      return preparedQuery;
    } catch (error) {
      report.addError()
      const { query, message } = error
      return Promise.reject({
        query,
        debugMessage: message,
        displayMessage: displayMessage(error, index),
      })
    }
  }

  const runVennQuery = async (left: string, right: string, sub: string, options: SearchOptions, weight: number, index: number) => {
    if (corpus.length === 0) {
      console.warn(`ran query against an empty corpus\nintersect(${left})(${right})\n${sub}`)
      return
    }

    setRunStrategy(RunStrategy.Venn)

    const preparedLeft = injectPrefix(left)(sub)
    const preparedRight = injectPrefix(right)(sub)

    try {
      const diagram = await generateVennDiagram(preparedLeft, preparedRight, options)
      const { cards, leftIds, bothIds, rightIds } = diagram

      rawData.current[sub] = cards.map((card: Card) => ({
        data: card,
        weight,
        matchedQueries: [sub],
        left: leftIds.has(card.id),
        both: bothIds.has(card.id),
        right: rightIds.has(card.id),
      }))
      report.addCardCount(cards.length)
      report.addComplete()
      return sub;
    } catch (error) {
      report.addError()
      const { query, message } = error
      return Promise.reject({
        query,
        debugMessage: message,
        displayMessage: displayMessage(error, index),
      })
    }
  }

  return {
    run: execute(runQuery),
    generateVenn: aggregateVenn(runVennQuery),
    runStrategy,
    result,
    reset,
    status,
    report,
    errors,
  }
}
