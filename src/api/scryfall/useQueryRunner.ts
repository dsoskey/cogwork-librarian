import * as Scry from 'scryfall-sdk'
import { Card, SearchOptions } from 'scryfall-sdk'
import cloneDeep from 'lodash/cloneDeep'
import MagicEmitter from 'scryfall-sdk/out/util/MagicEmitter'
import MagicQuerier, {
  List,
  SearchError,
} from 'scryfall-sdk/out/util/MagicQuerier'
import {
  QueryRunner,
  QueryRunnerFunc,
  QueryRunnerProps,
  weightAlgorithms,
} from '../queryRunnerCommon'
import { useQueryCoordinator } from '../useQueryCoordinator'
import { ResultAsync } from 'neverthrow'

class MyCards extends MagicQuerier {
  public searchCount(query: string, options?: SearchOptions | number) {
    let error: SearchError | undefined
    const emitter = new MagicEmitter<number>()

    this.query<List<Card>>('cards/search', {
      q: query,
      ...(typeof options === 'number' ? { page: options } : options),
    })
      .then((result) =>
        emitter.emit('data', Number.parseInt(result.total_cards))
      )
      .catch((err) => (error = err))

    return emitter
  }
}
const MY_CARDS = new MyCards()

export const useScryfallQueryRunner = ({
  getWeight = weightAlgorithms.uniform,
  injectPrefix,
}: QueryRunnerProps): QueryRunner => {
  const { status, result, report, cache, rawData, execute, errors } =
    useQueryCoordinator()

  const runQuery: QueryRunnerFunc = (
    query: string,
    index: number,
    options: SearchOptions
  ) =>
    ResultAsync.fromPromise(
      new Promise((resolve, reject) => {
        const weight = getWeight(index)
        const preparedQuery = injectPrefix(query)
        const _cacheKey = `${preparedQuery}:${JSON.stringify(options)}`
        rawData.current[preparedQuery] = []
        if (cache.current[_cacheKey] === undefined) {
          cache.current[_cacheKey] = []
          MY_CARDS.searchCount(preparedQuery, options).on('data', (data) => {
            report.setTotalCards((prev) => prev + data)
          })
          Scry.Cards.search(preparedQuery, options)
            .on('data', (data) => {
              rawData.current[preparedQuery].push({
                data,
                weight,
                matchedQueries: [query],
              })
              cache.current[_cacheKey].push({
                data,
                weight,
                matchedQueries: [query],
              })
              report.addCardCount()
            })
            .on('done', () => {
              report.addComplete()
              resolve(query)
            })
            .on('error', (e) => {
              report.addError()
              reject(e)
            })
        } else {
          rawData.current[preparedQuery] = cloneDeep(cache.current[_cacheKey])
          report.addCardCount(rawData.current[preparedQuery].length)
          report.addComplete()
          resolve(preparedQuery)
        }
      }),
      (e) => ({
        query,
        displayMessage: e.toLocaleString(),
        debugMessage: e.toLocaleString(),
      })
    )

  return {
    run: execute(runQuery),
    result,
    status,
    report,
    errors,
  }
}
