// noinspection ES6UnusedImports

import nearly, { Grammar, Parser } from 'nearley'
// @ts-ignore
import mql from './mql.ne'
import { normCardList, NormedCard } from './types/normedCard'
import { CardIdToCubeIds, CubeDefinition, invertCubes } from './types/cube'
import { getDirection, getOrder, QueryRunnerParams, SearchError } from './queryRunner'
import { SearchOptions } from './types/searchOptions'
import { err, ok, Result } from 'neverthrow'
import { Card, Legality } from 'scryfall-sdk'
import { NearlyError } from './types/error'
import { andNode, defaultOperation, FilterNode, identity, notNode, Operator, orNode } from './filters/base'
import { oracleNode } from './filters/oracle'
import { oddEvenFilter } from './filters/manavalue'
import { filters } from './filters'
import { exactMatch, regexMatch } from './filters/text'
import { nameFilter } from './filters/name'
import { chooseFilterFunc, printNode } from './filters/print'
import { byName, sortFunc, SortOrder } from './filters/sort'
import sortBy from 'lodash/sortBy'
import { FilterType } from './types/filterKeyword'
import { Prices } from 'scryfall-sdk/out/api/Cards'
import { colorMatch } from './filters/color'

interface FilterLeaf {
  filter: FilterType // TODO: enum?
  unit?: keyof Prices
  operator?: Operator
  value: any
}

interface BinaryNode {
  operator: "and" | "or"
  left: Node
  right: Node
}

interface UnaryNode {
  operator: "negate"
  clause: Node
}

type Node = BinaryNode | FilterLeaf | UnaryNode

const mqlGrammar = Grammar.fromCompiled(mql)

export const queryParser = () => new Parser(mqlGrammar)

interface Filters {
  getFilter: (leaf: FilterLeaf) => FilterNode
}
class FilterProvider implements Filters {
  // cubeId -> oracleId
  private readonly cubes: { [cubeId: string]: Set<string> }
  // otag -> oracleId
  private readonly otags: { [otag: string]: Set<string> }
  // atag -> id
  private readonly atags: { [atag: string]: Set<string> }

  constructor({ cubes }) {
    this.cubes = cubes;
  }

  cubeFilter = (cubeKey: string) => oracleNode({
    filtersUsed: ["cube"],
    filterFunc: (card: NormedCard) => this.cubes[cubeKey]?.has(card.oracle_id)
  })

  otagFilter = (tag: string) => oracleNode({
    filtersUsed: ["otag"],
    filterFunc: (card: NormedCard) => this.otags[tag]?.has(card.oracle_id)
  })

  atagFilter = (tag: string) => printNode(["atag"], ({printing}) => this.atags[tag]?.has(printing.id))

  getFilter = (leaf: FilterLeaf): FilterNode => {
    switch (leaf.filter) {
      case FilterType.CmcInt:
        return oracleNode({
          filtersUsed: ["cmc"],
          filterFunc: filters.defaultOperation("cmc", leaf.operator, leaf.value)
        })
      case FilterType.CmcOddEven:
        return filters.oddEvenFilter(leaf.value === "even")
      case FilterType.NameExact:
        return oracleNode({
          filtersUsed: ["exact"],
          filterFunc: filters.exactMatch("name", leaf.value)
        });
      case FilterType.Name:
        return oracleNode({
          filtersUsed: ["name"],
          filterFunc: filters.nameFilter(leaf.value)
        })
      case FilterType.NameRegex:
        return oracleNode({
          filtersUsed: ["name"],
          filterFunc: filters.regexMatch('name', leaf.value)
        })
      case FilterType.ColorSet:
        return filters.colorMatch(leaf.operator, new Set(leaf.value))
      case FilterType.ColorInt:
        return filters.colorCount(leaf.operator, leaf.value)
      case FilterType.ColorIdentitySet:
        return filters.colorIdentityMatch(leaf.operator, new Set(leaf.value))
      case FilterType.ColorIdentityInt:
        return filters.colorIdentityCount(leaf.operator, leaf.value)
      case FilterType.Mana:
        return filters.manaCostMatch(leaf.operator, leaf.value)
      case FilterType.Oracle:
        return oracleNode({
          filtersUsed: ["oracle"],
          filterFunc: filters.noReminderTextMatch('oracle_text', leaf.value),
        })
      case FilterType.OracleRegex:
        return oracleNode({
          filtersUsed: ["oracle"],
          filterFunc: filters.noReminderRegexMatch('oracle_text', leaf.value),
        })
      case FilterType.FullOracle:
        return oracleNode({
          filtersUsed: ["full-oracle"],
          filterFunc: filters.textMatch('oracle_text', leaf.value),
        })
      case FilterType.FullOracleRegex:
        return oracleNode({
          filtersUsed: ["full-oracle"],
          filterFunc: filters.regexMatch('oracle_text', leaf.value),
        })
      case FilterType.Keyword:
        return filters.keywordMatch(leaf.value)
      case FilterType.Type:
        return oracleNode({
          filtersUsed: ["type"],
          filterFunc: filters.textMatch('type_line', leaf.value),
        })
      case FilterType.TypeRegex:
        return oracleNode({
          filtersUsed: ["type-regex"],
          filterFunc: filters.regexMatch('type_line', leaf.value),
        })
      case FilterType.Power:
        return filters.combatToCombatNode('power', leaf.operator, leaf.value)
      case FilterType.Tough:
        return filters.combatToCombatNode('toughness', leaf.operator, leaf.value)
      case FilterType.PowTou:
        return filters.powTouTotalOperation(leaf.operator, leaf.value)
      case FilterType.Loyalty:
        return filters.combatToCombatNode('loyalty', leaf.operator, leaf.value)
      case FilterType.Layout:
        return oracleNode({
          filtersUsed: ["layout"],
          filterFunc: filters.defaultOperation('layout', leaf.operator, leaf.value),
        })
      case FilterType.Format:
        return filters.formatMatch("legal", leaf.value)
      case FilterType.Banned:
        return filters.formatMatch("banned", leaf.value)
      case FilterType.Restricted:
        return filters.formatMatch("restricted", leaf.value)
      case FilterType.Is:
        return filters.isVal(leaf.value)
      case FilterType.Not:
        return filters.not(filters.isVal(leaf.value))
      case FilterType.Prints:
        return filters.printCountFilter(leaf.operator, leaf.value)
      case FilterType.In:
        return filters.inFilter(leaf.value)
      case FilterType.ProducesSet:
        return oracleNode({
          filtersUsed: ["produces"],
          filterFunc: filters.producesMatch(leaf.operator, new Set(leaf.value)),
        })
      case FilterType.ProducesInt:
        return oracleNode({
          filtersUsed: ["produces"],
          filterFunc: filters.producesMatchCount(leaf.operator, leaf.value),
        })
      case FilterType.Devotion:
        return filters.devotionOperation(leaf.operator, leaf.value)
      case FilterType.Unique:
        return oracleNode({
          filtersUsed: [`unique:${leaf.value}`],
          filterFunc: identity(),
          inverseFunc: identity(),
        })
      case FilterType.Order:
        return oracleNode({
          filtersUsed: [`order:${leaf.value}`],
          filterFunc: identity(),
          inverseFunc: identity(),
        })
      case FilterType.Direction:
        return oracleNode({
          filtersUsed: [`direction:${leaf.value}`],
          filterFunc: identity(),
          inverseFunc: identity(),
        })
      case FilterType.Rarity:
        return filters.rarityFilter(leaf.operator, leaf.value)
      case FilterType.Set:
        return filters.setFilter(leaf.value)
      case FilterType.SetType:
        return filters.setTypeFilter(leaf.value)
      case FilterType.Artist:
        return filters.artistFilter(leaf.value)
      case FilterType.CollectorNumber:
        return filters.collectorNumberFilter(leaf.operator, leaf.value)
      case FilterType.Border:
        return filters.borderFilter(leaf.value)
      case FilterType.Date:
        return filters.dateFilter(leaf.operator, leaf.value)
      case FilterType.Price:
        return filters.priceFilter(leaf.unit, leaf.operator, leaf.value)
      case FilterType.Frame:
        return filters.frameFilter(leaf.value)
      case FilterType.Flavor:
        return filters.flavorMatch(leaf.value)
      case FilterType.FlavorRegex:
        return filters.flavorRegex(leaf.value)
      case FilterType.Game:
        return filters.gameNode(leaf.value)
      case FilterType.Language:
        return filters.languageNode(leaf.value)
      case FilterType.Stamp:
        return filters.stampFilter(leaf.value)
      case FilterType.Watermark:
        return filters.watermarkFilter(leaf.value)
      case FilterType.Cube:
        return this.cubeFilter(leaf.value)
      case FilterType.OracleTag:
        return this.otagFilter(leaf.value)

    }
  }
}
export class QueryRunner {
  private readonly corpus: NormedCard[]
  private readonly defaultOptions: SearchOptions
  // cubeId -> oracleId
  private readonly cubes: { [cubeId: string]: Set<string> }
  private readonly filters: FilterProvider

  constructor({ corpus, cubes, defaultOptions }: QueryRunnerParams) {
    this.corpus = normCardList(corpus, {}, {});
    const cubemap = {}
    for (const cube of cubes ?? []) {
      cubemap[cube.key] = new Set(cube.oracle_ids)
    }
    this.cubes = cubemap
    this.filters = new FilterProvider({ cubes: cubemap })
    this.defaultOptions = defaultOptions ?? { order: 'name' }
  }


  visitNode = (node: Node): FilterNode => {
    if (node.hasOwnProperty("filter")) {
      return this.filters.getFilter(node as FilterLeaf)
    } else {
      // @ts-ignore
      switch (node.operator) {
        case "negate":
          return notNode(this.visitNode((node as UnaryNode).clause));
        case "and":
          return andNode(
            this.visitNode((node as BinaryNode).left),
            this.visitNode((node as BinaryNode).right));
        case "or":
          return orNode(
            this.visitNode((node as BinaryNode).left),
            this.visitNode((node as BinaryNode).right));
      }

    }
  }
  search = (query: string, _options?: SearchOptions): Result<Card[], SearchError> => {
    const options = _options ?? this.defaultOptions
    const parser = queryParser();
    try {
      parser.feed(query)

      if (parser.results.length > 1) {
        const uniqueParses = new Set<string>(
          parser.results.map(it => JSON.stringify(it))
        )
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

    const root = parser.results[0] as Node

    const { filterFunc, filtersUsed, printFilter } = this.visitNode(root);

    const filtered = []
    try {
      for (const card of this.corpus) {
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