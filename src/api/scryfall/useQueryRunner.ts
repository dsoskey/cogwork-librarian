import * as Scry from 'scryfall-sdk'
import { Card, SearchOptions } from 'scryfall-sdk'
import cloneDeep from 'lodash/cloneDeep'
import MagicEmitter from 'scryfall-sdk/out/util/MagicEmitter'
import MagicQuerier, {
  List,
  SearchError,
} from 'scryfall-sdk/out/util/MagicQuerier'
import {
  injectors,
  QueryRunner,
  QueryRunnerProps,
  weightAlgorithms,
} from '../queryRunnerCommon'
import { useQueryCoordinator } from '../useQueryCoordinator'

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
const MYCARDS = new MyCards()

export const useScryfallQueryRunner = ({
  getWeight = weightAlgorithms.uniform,
  injectPrefix = injectors.none,
}: QueryRunnerProps): QueryRunner => {
  const { status, result, report, cache, rawData, execute } =
    useQueryCoordinator()

  const runQuery = (query: string, index: number, options: SearchOptions) =>
    new Promise((resolve, reject) => {
      const weight = getWeight(index)
      const _cacheKey = `${query}:${JSON.stringify(options)}`
      rawData.current[query] = []
      if (cache.current[_cacheKey] === undefined) {
        cache.current[_cacheKey] = []
        const preparedQuery = injectPrefix(query)
        MYCARDS.searchCount(preparedQuery, options).on('data', (data) => {
          report.setTotalCards((prev) => prev + data)
        })
        Scry.Cards.search(preparedQuery, options)
          .on('data', (data) => {
            rawData.current[query].push({
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
        rawData.current[query] = cloneDeep(cache.current[_cacheKey])
        report.addCardCount(rawData.current[query].length)
        report.addComplete()
        resolve(query)
      }
    })

  return {
    run: execute(runQuery),
    result,
    status,
    report,
  }
}
