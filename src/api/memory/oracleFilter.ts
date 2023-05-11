import { NormedCard } from './types/normedCard'
import {
  andNode,
  identityNode,
  orNode,
  notNode,
  FilterNode, Operator
} from './filters/base'
import { printFilters } from './printFilter'
import { defaultOperation, handlePrint } from './filters/oracle'
import { exactMatch, noReminderRegexMatch, noReminderTextMatch, regexMatch, textMatch } from './filters/text'
import { isVal } from './filters/is'
import { devotionOperation } from './filters/devotion'
import { combatOperation, powTouTotalOperation } from './filters/combat'
import { colorMatch } from './filters/color'
import { colorIdentityMatch } from './filters/identity'
import { producesMatch, producesMatchCount } from './filters/produces'
import { keywordMatch } from './filters/keyword'
import { manaCostMatch } from './filters/mana'
import { formatMatch } from './filters/format'
import { inFilter } from './filters/in'
import { cubeFilter } from './filters/cube'
import { rarityFilterNode } from './filters/rarity'

const setFilter = (value: string): FilterNode<NormedCard> =>
  handlePrint(['set'], printFilters.setFilter(value))

const setTypeFilter = (value: string): FilterNode<NormedCard> =>
  handlePrint(['set-type'], printFilters.setTypeFilter(value))

const artistFilter = (value: string): FilterNode<NormedCard> =>
  handlePrint(['artist'], printFilters.artistFilter(value))

const collectorNumberFilter = (operator: Operator, value: number): FilterNode<NormedCard> =>
  handlePrint(['collector-number'], printFilters.collectorNumberFilter(operator, value))

const borderFilter = (value: string): FilterNode<NormedCard> =>
  handlePrint(['border'], printFilters.borderFilter(value))

const dateFilter = (operator: Operator, value: string): FilterNode<NormedCard> =>
  handlePrint(['date'], printFilters.dateFilter(operator, value))

const priceFilter = (unit: string, operator: Operator, value: number): FilterNode<NormedCard> =>
  handlePrint([unit], printFilters.priceFilter(unit, operator, value))

const frameFilter = (value: string): FilterNode<NormedCard> =>
  handlePrint(['flavor'], printFilters.frameFilter(value))

const flavorMatch = (value: string): FilterNode<NormedCard> =>
  handlePrint(['flavor'], printFilters.flavorMatch(value))

const flavorRegex = (value: string): FilterNode<NormedCard> =>
  handlePrint(['flavor'], printFilters.flavorRegex(value))

const gameFilter = (value: string) =>
  handlePrint(['game'], printFilters.gameFilter(value))

const languageFilter = (value: string) =>
  handlePrint(['language'], printFilters.languageFilter(value))

const stampFilter = (value: string) =>
  handlePrint(['stamp'], printFilters.stampFilter(value))

const watermarkFilter = (value: string) =>
  handlePrint(['watermark'], printFilters.watermarkFilter(value))

export const oracleFilters = {
  identity: identityNode,
  and: andNode,
  or: orNode,
  not: notNode,
  defaultOperation,
  combatOperation,
  powTouTotalOperation,
  exactMatch,
  textMatch,
  noReminderTextMatch,
  regexMatch,
  noReminderRegexMatch,
  keywordMatch,
  colorMatch,
  colorIdentityMatch,
  manaCostMatch,
  formatMatch,
  isVal,
  inFilter,
  rarityFilter: rarityFilterNode,
  setFilter,
  setTypeFilter,
  artistFilter,
  collectorNumberFilter,
  borderFilter,
  dateFilter,
  frameFilter,
  priceFilter,
  flavorMatch,
  flavorRegex,
  gameFilter,
  languageFilter,
  stampFilter,
  watermarkFilter,
  cubeFilter,
  producesMatch,
  producesMatchCount,
  devotionOperation
}
