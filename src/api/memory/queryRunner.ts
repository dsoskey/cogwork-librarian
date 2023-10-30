import { Parser } from 'nearley'
import { normCardList, NormedCard } from './types/normedCard'
import { SearchOptions } from './types/searchOptions'
import { err, ok, Result } from 'neverthrow'
import { Card } from 'scryfall-sdk'
import { NearlyError, SearchError } from './types/error'
import { andNode, FilterNode, notNode, orNode } from './filters/base'
import { FilterProvider } from './filters'
import { chooseFilterFunc } from './filters/print'
import { byName, sortFunc, SortOrder } from './filters/sort'
import sortBy from 'lodash/sortBy'
import { IllustrationTag, OracleTag } from './types/tag'
import { BinaryNode, AstLeaf, UnaryNode, AstNode } from './types/ast'
import { MQLParser } from './mql'

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
  cubes?: { [cubeId: string]: Set<string> }
  oracleTags?: OracleTag[]
  illustrationTags?: IllustrationTag[]
  defaultOptions?: SearchOptions,
  getParser?: ParserProducer
}

export class QueryRunner {
  private readonly corpus: NormedCard[]
  private readonly defaultOptions: SearchOptions
  private readonly getParser: ParserProducer

  private readonly filters: FilterProvider

  constructor({ corpus, cubes, oracleTags, illustrationTags, defaultOptions, getParser }: QueryRunnerParams) {
    this.corpus = normCardList(corpus);
    const otags = {}
    for (const tag of oracleTags ?? []) {
      otags[tag.label] = new Set(tag.oracle_ids)
    }
    const atags = {}
    for (const tag of illustrationTags ?? []) {
      otags[tag.label] = new Set(tag.illustration_ids)
    }
    this.filters = new FilterProvider({ cubes, otags, atags })
    this.getParser = getParser ?? MQLParser
    this.defaultOptions = defaultOptions ?? { order: 'name' }
  }

  search = (query: string, _options?: SearchOptions): Result<Card[], SearchError> => {
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
  ): Result<Card[], SearchError> => {
    const visitNode = (node: AstNode): FilterNode => {
      if (node.hasOwnProperty("filter")) {
        return filters.getFilter(node as AstLeaf)
      } else {
        // @ts-ignore
        switch (node.operator) {
          case "negate":
            return notNode(visitNode((node as UnaryNode).clause));
          case "and":
            return andNode(
              visitNode((node as BinaryNode).left),
              visitNode((node as BinaryNode).right));
          case "or":
            return orNode(
              visitNode((node as BinaryNode).left),
              visitNode((node as BinaryNode).right));
        }

      }
    }

    const parser = getParser();
    try {
      console.debug(`feeding ${query}`)
      parser.feed(query)
      console.debug(`parsed`)
      console.debug(parser.results)
      if (parser.results.length > 1) {
        const uniqueParses = new Set(parser.results.map(it => JSON.stringify(it)))
        if (uniqueParses.size > 1) {
          console.warn('ambiguous parse!')
        }
      }
    } catch (error) {
      const { message, offset } = error as NearlyError
      console.error(message)
      return err({
        query,
        errorOffset: offset ?? 0,
        message,
      })
    }

    // filter normedCards
    const { filterFunc, filtersUsed, printFilter } =
      visitNode(parser.results[0] as AstNode);

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

    return ok(sorted)
  }
}