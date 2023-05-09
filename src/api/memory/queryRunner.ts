import { Card, SearchOptions } from 'scryfall-sdk/out/api/Cards'
import { err, ok, Result } from 'neverthrow'
import { NearlyError } from '../../error'
import { printingParser, queryParser } from './parser'
import { FilterRes } from './filters/base'
import { chooseFilterFunc, normCardList, NormedCard } from './types/normedCard'
import { sortFunc, SortOrder } from './filters/sort'
import { sortBy } from 'lodash'

export const getOrder = (filtersUsed: string[], options: SearchOptions): SortOrder => {
  const sortFilter = filtersUsed.find(it => it.startsWith('order:'))
  if (sortFilter !== undefined) {
    return sortFilter.replace('order:', '') as SortOrder
  }
  return options.order
}

export const getDirection = (filtersUsed: string[], options: SearchOptions) => {
  const dirFilter = filtersUsed.find(it => it.startsWith('direction:'))
  if (dirFilter !== undefined) {
    return dirFilter.replace("direction:", "")
  }
  return options.dir ?? 'auto'
}

interface SearchError {
  query: string
  errorOffset: number
  message: string
}

export class QueryRunner {
  private readonly corpus: NormedCard[]

  constructor(corpus: Card[]) {
    this.corpus = normCardList(corpus)
  }

  search = (query: string, options: SearchOptions): Result<Card[], SearchError> => {
    // parse query
    return QueryRunner.generateSearchFunction(this.corpus)(query, options)
  }

  static generateSearchFunction = (corpus: NormedCard[]) => (
    query: string,
    options: SearchOptions
  ): Result<Card[], SearchError> => {
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
      console.debug(message)
      return err({
        query,
        errorOffset: error.offset ?? 0,
        message,
      })
    }

    // filter normedCards
    const { filterFunc, filtersUsed } = parser
      .results[0] as FilterRes<NormedCard>
    const filtered = []
    for (const card of corpus) {
      if (filterFunc(card)) {
        filtered.push(card)
      }
    }

    // parse print logic
    const printParser = printingParser()
    try {
      console.debug(`feeding ${query} to print parser`)
      printParser.feed(query)
    } catch (error) {
      const { message } = error as NearlyError
      return err({
        query,
        errorOffset: error.offset ?? 0,
        message,
      })
    }
    const printFilterFunc = chooseFilterFunc(filtersUsed)

    // filter prints
    const printFiltered: Card[] = filtered
      .flatMap(printFilterFunc(printParser.results[0].filterFunc))
      .filter(it => it !== undefined)

    // sort
    const order: SortOrder = getOrder(filtersUsed, options)
    const sorted = sortBy(printFiltered, [...sortFunc(order), 'name']) as Card[]

    // direction
    const direction = getDirection(filtersUsed, options)
    if (direction === 'auto') {
      switch (order) {
        case 'rarity':
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
    } else if (direction === 'desc') {
      sorted.reverse()
    }

    return ok(sorted)
  }
}