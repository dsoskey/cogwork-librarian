import {
  defaultOperation,
  notNode, FilterNode, identity, andNode, orNode
} from './base'
import { exactMatch, noReminderRegexMatch, noReminderTextMatch, regexMatch, textMatch } from './text'
import { isVal } from './is'
import { devotionOperation } from './devotion'
import { combatToCombatNode, powTouTotalOperation } from './combat'
import { colorCount, colorMatch } from './color'
import { colorIdentityCount, colorIdentityMatch } from './identity'
import { producesMatch, producesMatchCount } from './produces'
import { keywordMatch } from './keyword'
import { manaCostMatch } from './mana'
import { formatMatch } from './format'
import { inFilter } from './in'
import { rarityFilterNode } from './rarity'
import { watermarkFilter } from './watermark'
import { stampFilter } from './stamp'
import { languageNode } from './language'
import { gameNode } from './game'
import { flavorMatch, flavorRegex } from './flavor'
import { dateNode } from './date'
import { setNode, setTypeNode } from './set'
import { priceNode } from './price'
import { artistNode } from './artist'
import { frameNode } from './frame'
import { borderNode } from './border'
import { collectorNumberNode } from './collectorNumber'
import { oddEvenFilter } from './manavalue'
import { nameFilter } from './name'
import { printCountFilter } from './printCount'
import { oracleNode } from './oracle'
import { NormedCard } from '../types/normedCard'
import { printNode } from './print'
import { FilterType } from '../types/filterKeyword'
import { AstLeaf, AstNode, BinaryNode, UnaryNode } from '../types/ast'
import { fromPromise, okAsync, ResultAsync } from 'neverthrow'
import { SearchError } from '../types/error'
import { DataProvider } from './dataProvider'


export interface FilterProvider {
  visitNode: (leaf: AstNode) => ResultAsync<FilterNode, SearchError>
}

export class CachingFilterProvider implements FilterProvider {
  private readonly provider: DataProvider
  // should these be cached?
  // cubeId -> oracleId
  private readonly cubes: { [cubeId: string]: Set<string> }
  private getCube = (cubeId: string): ResultAsync<Set<string>, SearchError> => {
    if (this.cubes[cubeId]) {
      return okAsync(this.cubes[cubeId])
    }
    return fromPromise(this.provider.getCube(cubeId)
      .then(cube => {
        if (cube === undefined){
          return Promise.reject({ query: '', message: `Couldn't find cube ${cubeId}`, errorOffset: 0 })
        }
        const set = new Set(cube.oracle_ids)
        this.cubes[cubeId] = set;
        return Promise.resolve(set)
      }),
      (it: SearchError) => it)
  }

  // otag -> oracleId
  private readonly otags: { [otag: string]: Set<string> }
  private getOtag = (key: string): ResultAsync<Set<string>, SearchError> => {
    if (this.otags[key]) {
      return okAsync(this.otags[key])
    }
    return fromPromise(this.provider.getOtag(key)
        .then(otag => {
          if (otag === undefined){
            return Promise.reject({ query: '', message: `Couldn't find oracle tag ${otag}`, errorOffset: 0 })
          }
          const set = new Set(otag.oracle_ids)
          this.otags[key] = set;
          return set
        }),
      (it: SearchError) => it)
  }

  // atag -> id
  private readonly atags: { [atag: string]: Set<string> }
  private getAtag = (key: string): ResultAsync<Set<string>, SearchError> => {
    if (this.atags[key]) {
      return okAsync(this.atags[key])
    }
    return fromPromise(this.provider.getAtag(key)
        .then(atag => {
          if (atag === undefined){
            return Promise.reject({ query: '', message: `Couldn't find oracle tag ${atag}`, errorOffset: 0 })
          }
          const set = new Set(atag.illustration_ids)
          this.atags[key] = set;
          return set
        }),
      (it: SearchError) => it)
  }

  constructor(provider: DataProvider) {
    this.provider = provider
    this.cubes = {}
    this.otags = {}
    this.atags = {}
  }

  cubeFilter = (cubeKey: string): ResultAsync<FilterNode, SearchError> =>
    this.getCube(cubeKey).map(ids => {
      return oracleNode({
        filtersUsed: ['cube'],
        filterFunc: (card: NormedCard) => ids.has(card.oracle_id)
      })
    })

  otagFilter = (key: string): ResultAsync<FilterNode, SearchError> =>
    this.getOtag(key).map(ids => {
      return oracleNode({
        filtersUsed: ['otag'],
        filterFunc: (card: NormedCard) => ids.has(card.oracle_id)
      })
    })

  atagFilter = (key: string): ResultAsync<FilterNode, SearchError> =>
    this.getAtag(key).map(ids => {
      return printNode(
        ['atag'],
        ({ printing }) => {
          return ids.has(printing.illustration_id) ||
            printing.card_faces.find(it => ids.has(it.illustration_id)) !== undefined
        }
      )
    })

  visitNode = (node: AstNode): ResultAsync<FilterNode, SearchError> => {
    if (node.hasOwnProperty("filter")) {
      return this.getFilter(node as AstLeaf)
    } else {
      // @ts-ignore
      switch (node.operator) {
        case "negate":
          return this.visitNode((node as UnaryNode).clause)
            .map(notNode);
        case "and":
          return ResultAsync.combine([
            this.visitNode((node as BinaryNode).left),
            this.visitNode((node as BinaryNode).right),
          ]).map(([l, r])=> andNode(l, r))
        case "or":
          return ResultAsync.combine([
            this.visitNode((node as BinaryNode).left),
            this.visitNode((node as BinaryNode).right),
          ]).map(([l, r])=> orNode(l, r))
      }
    }
  }

  getFilter = (leaf: AstLeaf): ResultAsync<FilterNode, SearchError> => {
    switch (leaf.filter) {
      case FilterType.CmcInt:
        return okAsync(oracleNode({
          filtersUsed: ["cmc"],
          filterFunc: defaultOperation("cmc", leaf.operator, leaf.value)
        }))
      case FilterType.CmcOddEven:
        return okAsync(oddEvenFilter(leaf.value === "even"))
      case FilterType.NameExact:
        return okAsync(oracleNode({
          filtersUsed: ["exact"],
          filterFunc: exactMatch("name", leaf.value)
        }));
      case FilterType.Name:
        return okAsync(oracleNode({
          filtersUsed: ["name"],
          filterFunc: nameFilter(leaf.value)
        }));
      case FilterType.NameRegex:
        return okAsync(oracleNode({
          filtersUsed: ["name"],
          filterFunc: regexMatch('name', leaf.value)
        }));
      case FilterType.ColorSet:
        return okAsync(colorMatch(leaf.operator, new Set(leaf.value)))
      case FilterType.ColorInt:
        return okAsync(colorCount(leaf.operator, leaf.value))
      case FilterType.ColorIdentitySet:
        return okAsync(colorIdentityMatch(leaf.operator, new Set(leaf.value)))
      case FilterType.ColorIdentityInt:
        return okAsync(colorIdentityCount(leaf.operator, leaf.value))
      case FilterType.Mana:
        return okAsync(manaCostMatch(leaf.operator, leaf.value))
      case FilterType.Oracle:
        return okAsync(oracleNode({
          filtersUsed: ["oracle"],
          filterFunc: noReminderTextMatch('oracle_text', leaf.value),
        }))
      case FilterType.OracleRegex:
        return okAsync(oracleNode({
          filtersUsed: ["oracle"],
          filterFunc: noReminderRegexMatch('oracle_text', leaf.value),
        }))
      case FilterType.FullOracle:
        return okAsync(oracleNode({
          filtersUsed: ["full-oracle"],
          filterFunc: textMatch('oracle_text', leaf.value),
        }))
      case FilterType.FullOracleRegex:
        return okAsync(oracleNode({
          filtersUsed: ["full-oracle"],
          filterFunc: regexMatch('oracle_text', leaf.value),
        }))
      case FilterType.Keyword:
        return okAsync(keywordMatch(leaf.value))
      case FilterType.Type:
        return okAsync(oracleNode({
          filtersUsed: ["type"],
          filterFunc: textMatch('type_line', leaf.value),
        }))
      case FilterType.TypeRegex:
        return okAsync(oracleNode({
          filtersUsed: ["type-regex"],
          filterFunc: regexMatch('type_line', leaf.value),
        }))
      case FilterType.Power:
        return okAsync(combatToCombatNode('power', leaf.operator, leaf.value))
      case FilterType.Tough:
        return okAsync(combatToCombatNode('toughness', leaf.operator, leaf.value))
      case FilterType.PowTou:
        return okAsync(powTouTotalOperation(leaf.operator, leaf.value))
      case FilterType.Loyalty:
        return okAsync(combatToCombatNode('loyalty', leaf.operator, leaf.value))
      case FilterType.Defense:
        return okAsync(combatToCombatNode('defense', leaf.operator, leaf.value))
      case FilterType.Layout:
        return okAsync(oracleNode({
          filtersUsed: ["layout"],
          filterFunc: defaultOperation('layout', "=", leaf.value),
        }))
      case FilterType.Format:
        return okAsync(formatMatch("legal", leaf.value))
      case FilterType.Banned:
        return okAsync(formatMatch("banned", leaf.value))
      case FilterType.Restricted:
        return okAsync(formatMatch("restricted", leaf.value))
      case FilterType.Is:
        return okAsync(isVal(leaf.value))
      case FilterType.Not:
        return okAsync(notNode(isVal(leaf.value)))
      case FilterType.Prints:
        return okAsync(printCountFilter(leaf.operator, leaf.value))
      case FilterType.In:
        return okAsync(inFilter(leaf.value))
      case FilterType.ProducesSet:
        return okAsync(oracleNode({
          filtersUsed: ["produces"],
          filterFunc: producesMatch(leaf.operator, new Set(leaf.value)),
        }))
      case FilterType.ProducesInt:
        return okAsync(oracleNode({
          filtersUsed: ["produces"],
          filterFunc: producesMatchCount(leaf.operator, leaf.value),
        }))
      case FilterType.Devotion:
        return okAsync(devotionOperation(leaf.operator, leaf.value))
      case FilterType.Unique:
        return okAsync(oracleNode({
          filtersUsed: [`unique:${leaf.value}`],
          filterFunc: identity(),
          inverseFunc: identity(),
        }))
      case FilterType.Order:
        return okAsync(oracleNode({
          filtersUsed: [`order:${leaf.value}`],
          filterFunc: identity(),
          inverseFunc: identity(),
        }))
      case FilterType.Direction:
        return okAsync(oracleNode({
          filtersUsed: [`direction:${leaf.value}`],
          filterFunc: identity(),
          inverseFunc: identity(),
        }))
      case FilterType.Rarity:
        return okAsync(rarityFilterNode(leaf.operator, leaf.value))
      case FilterType.Set:
        return okAsync(setNode(leaf.value))
      case FilterType.SetType:
        return okAsync(setTypeNode(leaf.value))
      case FilterType.Artist:
        return okAsync(artistNode(leaf.value))
      case FilterType.CollectorNumber:
        return okAsync(collectorNumberNode(leaf.operator, leaf.value))
      case FilterType.Border:
        return okAsync(borderNode(leaf.value))
      case FilterType.Date:
        return okAsync(dateNode(leaf.operator, leaf.value))
      case FilterType.Price:
        return okAsync(priceNode(leaf.unit, leaf.operator, leaf.value))
      case FilterType.Frame:
        return okAsync(frameNode(leaf.value))
      case FilterType.Flavor:
        return okAsync(flavorMatch(leaf.value))
      case FilterType.FlavorRegex:
        return okAsync(flavorRegex(leaf.value))
      case FilterType.Game:
        return okAsync(gameNode(leaf.value))
      case FilterType.Language:
        return okAsync(languageNode(leaf.value))
      case FilterType.Stamp:
        return okAsync(stampFilter(leaf.value))
      case FilterType.Watermark:
        return okAsync(watermarkFilter(leaf.value))
      case FilterType.Cube:
        return this.cubeFilter(leaf.value)
      case FilterType.OracleTag:
        return this.otagFilter(leaf.value)
      case FilterType.IllustrationTag:
        return this.atagFilter(leaf.value)
    }
  }
}