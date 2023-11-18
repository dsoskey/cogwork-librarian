import { Parser } from 'nearley'
import { normCardList, NormedCard } from './types/normedCard'
import { SearchOptions } from './types/searchOptions'
import { errAsync, ResultAsync } from 'neverthrow'
import { Card } from 'scryfall-sdk'
import { NearlyError, SearchError } from './types/error'
import { FilterProvider, CachingFilterProvider } from './filters'
import { chooseFilterFunc } from './filters/print'
import { byName, sortFunc, SortOrder } from './filters/sort'
import sortBy from 'lodash/sortBy'
import { AstNode } from './types/ast'
import { MQLParser } from './mql'
import { DataProvider } from './filters/dataProvider'

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

type ParserProducer = () => Parser

export interface QueryRunnerParams {
  corpus: Card[]
  defaultOptions?: SearchOptions,
  dataProvider: DataProvider
  getParser?: ParserProducer
}

export class QueryRunner {
  private readonly corpus: NormedCard[]
  private readonly defaultOptions: SearchOptions
  private readonly getParser: ParserProducer

  private readonly filters: FilterProvider

  constructor({ corpus, defaultOptions, dataProvider, getParser }: QueryRunnerParams) {
    this.corpus = normCardList(corpus);
    this.filters = new CachingFilterProvider(dataProvider)
    this.getParser = getParser ?? MQLParser
    this.defaultOptions = defaultOptions ?? { order: 'name' }
  }

  search = (query: string, _options?: SearchOptions): ResultAsync<Card[], SearchError> => {
    const options = _options ?? this.defaultOptions
    const func = QueryRunner.generateSearchFunction(this.corpus, this.filters, this.getParser)
    return func(query, options)
  }

  static generateSearchFunction = (
    corpus: NormedCard[],
    filters: FilterProvider,
    getParser: ParserProducer = MQLParser
  ) => (
    query: string,
    options: SearchOptions
  ): ResultAsync<Card[], SearchError> => {
    const parser = getParser();
    try {
      console.debug(`feeding ${query}`)
      parser.feed(query)
      console.debug(`parsed`)
      if (parser.results.length > 1) {
        console.debug(parser.results)
        const uniqueParses = new Set(parser.results.map(it => JSON.stringify(it)))
        if (uniqueParses.size > 1) {
          console.warn('ambiguous parse!')
        }
      } else if (parser.results.length === 1) {
        console.debug(parser.results[0])
      } else {
        console.warn("no matched parses")
      }
    } catch (error) {
      const { message, offset } = error as NearlyError
      console.error(message)
      return errAsync({
        query,
        errorOffset: offset ?? 0,
        message,
      })
    }

    return filters.visitNode(parser.results[0] as AstNode)
      .map(node => {
        const { filtersUsed, printFilter, filterFunc } = node;

        // filter normedCards
        const filtered: NormedCard[] = []
        // try {
          for (const card of corpus) {
            if (filterFunc(card)) {
              filtered.push(card)
            }
          }
        // } catch (e) {
        //   console.error(e)
        //   return err({
        //     query,
        //     errorOffset: 0, // how do i manage this??
        //     message: `Filter error: ${e.message}`,
        //   })
        // }

        const printFilterFunc = chooseFilterFunc(filtersUsed)

        // filter prints
        const printFiltered: Card[] = filtered
          .flatMap(printFilterFunc(printFilter))
          .filter(it => it !== undefined)

        // sort
        const order: SortOrder = getOrder(filtersUsed, options)
        const sorted = sortBy(printFiltered, [...sortFunc(order), byName]) as Card[]

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

        return sorted
      })
  }
}