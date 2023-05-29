import {
  EnrichedCard,
  QueryHandler,
  QueryRunnerFunc,
} from './queryRunnerCommon'
import { SearchOptions } from 'scryfall-sdk'
import { TaskStatus } from '../types'
import { useReporter } from './useReporter'
import { MutableRefObject, useRef, useState } from 'react'
import { sortBy } from 'lodash'
import { CogError } from '../error'

type QueryStore<T> = MutableRefObject<{ [query: string]: Array<T> }>

export interface QueryExecutor extends QueryHandler {
  execute: (
    funk: QueryRunnerFunc
  ) => (queries: string[], options: SearchOptions) => Promise<void>
  cache: QueryStore<EnrichedCard>
  rawData: QueryStore<EnrichedCard>
}
export const useQueryCoordinator = (): QueryExecutor => {
  const [status, setStatus] = useState<TaskStatus>('unstarted')
  const [errors, setErrors] = useState<CogError[]>([])
  const [result, setResult] = useState<Array<EnrichedCard>>([])
  const report = useReporter()

  // Should this be an implementation detail of query runners?
  const cache = useRef<{ [query: string]: Array<EnrichedCard> }>({})
  const rawData = useRef<{ [query: string]: Array<EnrichedCard> }>({})

  // should this be async/await so app can autoscroll on mobile when execute is done ?
  const execute =
    (runQuery: QueryRunnerFunc) =>
    (queries: string[], options: SearchOptions) => new Promise<void>((resolve, reject) => {
      setStatus('loading')
      const filteredQueries = queries.filter(
        (q) => q.trim().length > 0 && q.trim().charAt(0) !== '#'
      )
      if (filteredQueries.length === 0) {
        // add a dummy query to inject the base query into for a single query
        filteredQueries.push('')
      }
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

        const errors = promiseResults
          .filter((it) => it.status === 'fulfilled' && it.value.isErr())
          // @ts-ignore
          .map((it) => it.value.error)

        setErrors(errors)
        setStatus(errors.length ? 'error' : 'success')
        report.markTimepoint('end')
        setResult(sorted)
        if (errors.length) {
          reject("error thrown")
        } else {
          resolve()
        }
      })
    })

  return {
    status,
    report,
    result,
    execute,
    rawData,
    cache,
    errors,
  }
}
