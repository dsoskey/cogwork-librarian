import { EnrichedCard, QueryHandler } from './queryRunnerCommon'
import { SearchOptions } from 'scryfall-sdk'
import { TaskStatus } from '../types'
import { useReporter } from './useReporter'
import { MutableRefObject, useCallback, useRef, useState } from 'react'
import { sortBy } from 'lodash'

type QueryRunnerFunc = (
  query: string,
  index: number,
  options: SearchOptions
) => Promise<string>

type QueryStore<T> = MutableRefObject<{ [query: string]: Array<T> }>

export interface QueryExecutor extends QueryHandler {
  execute: (
    QueryRunnerFunc
  ) => (queries: string[], options: SearchOptions) => void
  cache: QueryStore<EnrichedCard>
  rawData: QueryStore<EnrichedCard>
}

export const useQueryCoordinator = (): QueryExecutor => {
  const [status, setStatus] = useState<TaskStatus>('unstarted')
  const [result, setResult] = useState<Array<EnrichedCard>>([])
  const report = useReporter()

  // Should this be an implementation detail of query runners?
  const cache = useRef<{ [query: string]: Array<EnrichedCard> }>({})
  const rawData = useRef<{ [query: string]: Array<EnrichedCard> }>({})

  const execute = useCallback(
    (runQuery: QueryRunnerFunc) =>
      (queries: string[], options: SearchOptions) => {
        setStatus('loading')
        const filteredQueries = queries.filter(
          (q) => q.trim().length > 0 && q.trim().charAt(0) !== '#'
        )
        report.reset(filteredQueries.length)
        rawData.current = {}
        Promise.allSettled(
          filteredQueries.map((q, i) => runQuery(q, i, options))
        ).then((promiseResults) => {
          const orgo: { [id: string]: EnrichedCard } = {}

          Object.values(rawData.current).forEach((q) => {
            q.forEach((card) => {
              const maybeCard = orgo[card.data.id]
              if (maybeCard !== undefined) {
                maybeCard.weight += card.weight
                maybeCard.matchedQueries.push(...card.matchedQueries)
              } else {
                orgo[card.data.id] = card
              }
            })
          })

          const sorted: Array<EnrichedCard> = sortBy(Object.values(orgo), [
            (it) => -it.weight,
          ])
          const throwErr = promiseResults.filter(
            (it) => it.status === 'rejected'
          ).length
          setStatus(throwErr ? 'error' : 'success')
          report.markTimepoint('end')
          setResult(sorted)
        })
      },
    [report, result, setResult, status, setStatus]
  )

  return {
    status,
    report,
    result,
    execute,
    rawData,
    cache,
  }
}
