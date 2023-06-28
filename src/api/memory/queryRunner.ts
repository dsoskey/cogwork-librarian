import sortBy from 'lodash/sortBy'
import { Card } from 'scryfall-sdk'
import { err, ok, Result } from 'neverthrow'
import { NearlyError } from './types/error'
import { queryParser } from './parser'
import { FilterNode } from './filters/base'
import { normCardList, NormedCard } from './types/normedCard'
import { CubeDefinition, invertCubes } from './types/cube'
import { sortFunc, SortOrder } from './filters/sort'
import { chooseFilterFunc } from './filters/print'
import { Parser } from 'nearley'
import { SearchOptions } from './types/searchOptions'

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

type ParserProducer = () => Parser

interface QueryRunnerParams {
  corpus: Card[]
  cubes?: CubeDefinition[]
  defaultOptions?: SearchOptions,
  getParser?: ParserProducer
}
export class QueryRunner {
  private readonly corpus: NormedCard[]
  private readonly defaultOptions: SearchOptions

  private readonly getParser: ParserProducer

  constructor({ corpus, getParser, defaultOptions, cubes }: QueryRunnerParams) {
    this.corpus = normCardList(corpus, invertCubes(cubes ?? []))
    this.getParser = getParser ?? queryParser
    this.defaultOptions = defaultOptions ?? { order: 'name' }
  }

  search = (query: string, options?: SearchOptions): Result<Card[], SearchError> => {
    // parse query
    const func = QueryRunner.generateSearchFunction(this.corpus, this.getParser)
    return func(query, options ?? this.defaultOptions)
  }

  static generateSearchFunction = (corpus: NormedCard[], getParser: ParserProducer = queryParser) => (
    query: string,
    options: SearchOptions
  ): Result<Card[], SearchError> => {
    // parse query
    const parser = getParser()
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
      console.error(message)
      return err({
        query,
        errorOffset: error.offset ?? 0,
        message,
      })
    }

    // filter normedCards
    const { filterFunc, filtersUsed, printFilter } = parser
      .results[0] as FilterNode
    const filtered = []
    try {
      for (const card of corpus) {
        if (filterFunc(card)) {
          filtered.push(card)
        }
      }
    } catch (e) {
      console.error(e)
      return err({
        query,
        errorOffset: 0, // how do i manage this??
        message: `Filter error: ${e.message}`,
      })
    }

    const printFilterFunc = chooseFilterFunc(filtersUsed)

    // filter prints
    const printFiltered: Card[] = filtered
      .flatMap(printFilterFunc(printFilter))
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