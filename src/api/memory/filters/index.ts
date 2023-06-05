import {
  andNode,
  identityNode,
  orNode,
  notNode,
} from './base'
import { defaultOperation } from './oracle'
import { exactMatch, noReminderRegexMatch, noReminderTextMatch, regexMatch, textMatch } from './text'
import { isVal } from './is'
import { devotionOperation } from './devotion'
import { combatToCombatNode, powTouTotalOperation } from './combat'
import { colorMatch } from './color'
import { colorIdentityCount, colorIdentityMatch } from './identity'
import { producesMatch, producesMatchCount } from './produces'
import { keywordMatch } from './keyword'
import { manaCostMatch } from './mana'
import { formatMatch } from './format'
import { inFilter } from './in'
import { cubeFilter } from './cube'
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
export const filters = {
  identity: identityNode,
  and: andNode,
  or: orNode,
  not: notNode,
  defaultOperation,
  combatToCombatNode,
  powTouTotalOperation,
  exactMatch,
  textMatch,
  noReminderTextMatch,
  regexMatch,
  noReminderRegexMatch,
  keywordMatch,
  colorMatch,
  colorIdentityMatch,
  colorIdentityCount,
  manaCostMatch,
  formatMatch,
  isVal,
  inFilter,
  rarityFilter: rarityFilterNode,
  setFilter: setNode,
  setTypeFilter: setTypeNode,
  artistFilter: artistNode,
  collectorNumberFilter: collectorNumberNode,
  borderFilter: borderNode,
  dateFilter: dateNode,
  frameFilter: frameNode,
  priceFilter: priceNode,
  flavorMatch,
  flavorRegex,
  gameNode,
  languageNode,
  stampFilter,
  watermarkFilter,
  cubeFilter,
  producesMatch,
  producesMatchCount,
  devotionOperation
}
