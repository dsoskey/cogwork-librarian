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

export interface FilterProvider {
  visitNode: (leaf: AstNode) => FilterNode
}

export class MemoryFilterProvider implements FilterProvider {
  // cubeId -> oracleId
  private readonly cubes: { [cubeId: string]: Set<string> }
  // otag -> oracleId
  private readonly otags: { [otag: string]: Set<string> }
  // atag -> id
  private readonly atags: { [atag: string]: Set<string> }

  constructor({ cubes, otags, atags }) {
    this.cubes = cubes;
    this.otags = otags;
    this.atags = atags;
  }

  cubeFilter = (cubeKey: string) => oracleNode({
    filtersUsed: ["cube"],
    filterFunc: (card: NormedCard) => this.cubes[cubeKey]?.has(card.oracle_id)
  })

  otagFilter = (key: string) => oracleNode({
    filtersUsed: ["otag"],
    filterFunc: (card: NormedCard) => this.otags[key]?.has(card.oracle_id)
  })

  atagFilter = (key: string) => printNode(
    ["atag"],
    ({printing}) => {
      const tag = this.atags[key]
      return tag?.has(printing.illustration_id) ||
        printing.card_faces.find(it=>tag?.has(it.illustration_id)) !== undefined
    }
  )

  visitNode = (node: AstNode): FilterNode => {
    if (node.hasOwnProperty("filter")) {
      return this.getFilter(node as AstLeaf)
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

  getFilter = (leaf: AstLeaf): FilterNode => {
    switch (leaf.filter) {
      case FilterType.CmcInt:
        return oracleNode({
          filtersUsed: ["cmc"],
          filterFunc: defaultOperation("cmc", leaf.operator, leaf.value)
        })
      case FilterType.CmcOddEven:
        return oddEvenFilter(leaf.value === "even")
      case FilterType.NameExact:
        return oracleNode({
          filtersUsed: ["exact"],
          filterFunc: exactMatch("name", leaf.value)
        });
      case FilterType.Name:
        return oracleNode({
          filtersUsed: ["name"],
          filterFunc: nameFilter(leaf.value)
        })
      case FilterType.NameRegex:
        return oracleNode({
          filtersUsed: ["name"],
          filterFunc: regexMatch('name', leaf.value)
        })
      case FilterType.ColorSet:
        return colorMatch(leaf.operator, new Set(leaf.value))
      case FilterType.ColorInt:
        return colorCount(leaf.operator, leaf.value)
      case FilterType.ColorIdentitySet:
        return colorIdentityMatch(leaf.operator, new Set(leaf.value))
      case FilterType.ColorIdentityInt:
        return colorIdentityCount(leaf.operator, leaf.value)
      case FilterType.Mana:
        return manaCostMatch(leaf.operator, leaf.value)
      case FilterType.Oracle:
        return oracleNode({
          filtersUsed: ["oracle"],
          filterFunc: noReminderTextMatch('oracle_text', leaf.value),
        })
      case FilterType.OracleRegex:
        return oracleNode({
          filtersUsed: ["oracle"],
          filterFunc: noReminderRegexMatch('oracle_text', leaf.value),
        })
      case FilterType.FullOracle:
        return oracleNode({
          filtersUsed: ["full-oracle"],
          filterFunc: textMatch('oracle_text', leaf.value),
        })
      case FilterType.FullOracleRegex:
        return oracleNode({
          filtersUsed: ["full-oracle"],
          filterFunc: regexMatch('oracle_text', leaf.value),
        })
      case FilterType.Keyword:
        return keywordMatch(leaf.value)
      case FilterType.Type:
        return oracleNode({
          filtersUsed: ["type"],
          filterFunc: textMatch('type_line', leaf.value),
        })
      case FilterType.TypeRegex:
        return oracleNode({
          filtersUsed: ["type-regex"],
          filterFunc: regexMatch('type_line', leaf.value),
        })
      case FilterType.Power:
        return combatToCombatNode('power', leaf.operator, leaf.value)
      case FilterType.Tough:
        return combatToCombatNode('toughness', leaf.operator, leaf.value)
      case FilterType.PowTou:
        return powTouTotalOperation(leaf.operator, leaf.value)
      case FilterType.Loyalty:
        return combatToCombatNode('loyalty', leaf.operator, leaf.value)
      case FilterType.Layout:
        return oracleNode({
          filtersUsed: ["layout"],
          filterFunc: defaultOperation('layout', leaf.operator, leaf.value),
        })
      case FilterType.Format:
        return formatMatch("legal", leaf.value)
      case FilterType.Banned:
        return formatMatch("banned", leaf.value)
      case FilterType.Restricted:
        return formatMatch("restricted", leaf.value)
      case FilterType.Is:
        return isVal(leaf.value)
      case FilterType.Not:
        return notNode(isVal(leaf.value))
      case FilterType.Prints:
        return printCountFilter(leaf.operator, leaf.value)
      case FilterType.In:
        return inFilter(leaf.value)
      case FilterType.ProducesSet:
        return oracleNode({
          filtersUsed: ["produces"],
          filterFunc: producesMatch(leaf.operator, new Set(leaf.value)),
        })
      case FilterType.ProducesInt:
        return oracleNode({
          filtersUsed: ["produces"],
          filterFunc: producesMatchCount(leaf.operator, leaf.value),
        })
      case FilterType.Devotion:
        return devotionOperation(leaf.operator, leaf.value)
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
        return rarityFilterNode(leaf.operator, leaf.value)
      case FilterType.Set:
        return setNode(leaf.value)
      case FilterType.SetType:
        return setTypeNode(leaf.value)
      case FilterType.Artist:
        return artistNode(leaf.value)
      case FilterType.CollectorNumber:
        return collectorNumberNode(leaf.operator, leaf.value)
      case FilterType.Border:
        return borderNode(leaf.value)
      case FilterType.Date:
        return dateNode(leaf.operator, leaf.value)
      case FilterType.Price:
        return priceNode(leaf.unit, leaf.operator, leaf.value)
      case FilterType.Frame:
        return frameNode(leaf.value)
      case FilterType.Flavor:
        return flavorMatch(leaf.value)
      case FilterType.FlavorRegex:
        return flavorRegex(leaf.value)
      case FilterType.Game:
        return gameNode(leaf.value)
      case FilterType.Language:
        return languageNode(leaf.value)
      case FilterType.Stamp:
        return stampFilter(leaf.value)
      case FilterType.Watermark:
        return watermarkFilter(leaf.value)
      case FilterType.Cube:
        return this.cubeFilter(leaf.value)
      case FilterType.OracleTag:
        return this.otagFilter(leaf.value)
      case FilterType.IllustrationTag:
        return this.atagFilter(leaf.value)
    }
  }
}