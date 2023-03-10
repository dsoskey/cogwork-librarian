import isEqual from 'lodash/isEqual'
import {
  anyFaceContains,
  anyFaceRegexMatch,
  DOUBLE_FACED_LAYOUTS,
  hasNumLandTypes,
  isDual,
  IsValue,
  noReminderText,
  SHOCKLAND_REGEX,
  toManaCost,
} from '../card'
import { Format, Legality } from 'scryfall-sdk/out/api/Cards'
import { NormedCard, OracleKeys } from '../local/normedCard'
import { ObjectValues } from '../../types'
import { not, Filter, andRes, identityRes, orRes, notRes, FilterRes } from './filterBase'
import { printFilters } from './printFilter'

export const EQ_OPERATORS = {
  ':': ':',
  '=': '=',
} as const
export type EqualityOperator = ObjectValues<typeof EQ_OPERATORS>

export const OPERATORS = {
  ...EQ_OPERATORS,
  '!=': '!=',
  '<>': '<>',
  '<': '<',
  '<=': '<=',
  '>': '>',
  '>=': '>=',
} as const
export type Operator = ObjectValues<typeof OPERATORS>

// these should go on the card object itself
export const parsePowTou = (value: any) =>
  value !== undefined
    ? Number.parseInt(value.toString().replace('*', '0'), 10)
    : 0

const replaceNamePlaceholder = (text: string, name: string): string => {
  return text.replace(/~/g, name).toLowerCase()
}

const defaultOperation =
  (field: OracleKeys, operator: Operator, value: any): Filter<NormedCard> =>
  (card: NormedCard) => {
    const cardValue = card[field]
    if (cardValue === undefined) return false
    switch (operator) {
      case ':':
      case '=':
        return cardValue === value
      case '!=':
      case '<>':
        return cardValue !== value
      case '<':
        return cardValue < value
      case '<=':
        return cardValue <= value
      case '>':
        return cardValue > value
      case '>=':
        return cardValue >= value
    }
  }

const powTouOperation =
  (
    field: OracleKeys,
    operator: Operator,
    targetValue: number
  ): Filter<NormedCard> =>
  (card: NormedCard) => {
    const cardValue = card[field]
    if (cardValue === undefined) return false

    const valueToTest = parsePowTou(cardValue)
    switch (operator) {
      case ':':
      case '=':
        return valueToTest === targetValue
      case '!=':
      case '<>':
        return valueToTest !== targetValue
      case '<':
        return valueToTest < targetValue
      case '<=':
        return valueToTest <= targetValue
      case '>':
        return valueToTest > targetValue
      case '>=':
        return valueToTest >= targetValue
    }
  }

const textMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
  (card: NormedCard) => {
    return anyFaceContains(
      card,
      field,
      replaceNamePlaceholder(value, card.name)
    )
  }

const noReminderTextMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
  (card: NormedCard) =>
    anyFaceContains(
      card,
      field,
      replaceNamePlaceholder(value, card.name),
      noReminderText
    )

const regexMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
  (card: NormedCard) =>
    anyFaceRegexMatch(
      card,
      field,
      new RegExp(replaceNamePlaceholder(value, card.name))
    )

const noReminderRegexMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
  (card: NormedCard) =>
    anyFaceRegexMatch(
      card,
      field,
      new RegExp(replaceNamePlaceholder(value, card.name)),
      noReminderText
    )

const keywordMatch = (value: string) => (card: NormedCard) =>
  card.keywords.map((it) => it.toLowerCase()).includes(value.toLowerCase())

const colorMatch =
  (operator: Operator, value: Set<string>): Filter<NormedCard> =>
  (card: NormedCard) => {
    const faceMatchMap = [
      card.colors,
      ...card.card_faces.map((it) => it.colors),
    ]
      .filter((it) => it !== undefined)
      .map((colors) => colors.map((it) => it.toLowerCase()))
      .map((colors) => ({
        match: colors.filter((color) => value.has(color)),
        not: colors.filter((color) => !value.has(color)),
      }))
    switch (operator) {
      case '=':
        return (
          faceMatchMap.filter(
            (it) => it.match.length === value.size && it.not.length === 0
          ).length > 0
        )
      case '!=':
        return faceMatchMap.filter((it) => it.match.length === 0).length > 0
      case '<':
        return (
          faceMatchMap.filter(
            (it) => it.not.length === 0 && it.match.length < value.size
          ).length > 0
        )
      case '<=':
        return (
          faceMatchMap.filter(
            (it) => it.not.length === 0 && it.match.length <= value.size
          ).length > 0
        )
      case '>':
        return (
          faceMatchMap.filter(
            (it) => it.not.length > 0 && it.match.length === value.size
          ).length > 0
        )
      // Scryfall adapts ":" to the context. in this context it acts as >=
      case ':':
      case '>=':
        return (
          faceMatchMap.filter((it) => it.match.length === value.size).length > 0
        )
      case '<>':
        throw 'throw something better please!'
    }
  }

const colorIdentityMatch =
  (operator: Operator, value: Set<string>): Filter<NormedCard> =>
  (card: NormedCard) => {
    const colors = card.color_identity.map((it) => it.toLowerCase())
    const matchedColors = colors.filter((color) => value.has(color))
    const notMatchedColors = colors.filter((color) => !value.has(color))
    switch (operator) {
      case '=':
        return (
          matchedColors.length === value.size && notMatchedColors.length === 0
        )
      case '!=':
        return matchedColors.length === 0
      case '<':
        return (
          notMatchedColors.length === 0 && matchedColors.length < value.size
        )
      // Scryfall adapts ":" to the context. in this context it acts as <=
      case ':':
      case '<=':
        return (
          notMatchedColors.length === 0 && matchedColors.length <= value.size
        )
      case '>':
        return (
          notMatchedColors.length > 0 && matchedColors.length === value.size
        )
      case '>=':
        return matchedColors.length === value.size
      case '<>':
        throw 'throw something better please!'
    }
  }

const manaCostMatch =
  (operator: Operator, value: string[]): Filter<NormedCard> =>
  (card: NormedCard) => {
    const targetCost = toManaCost(value)
    const entries = Object.entries(targetCost)
    const cardCosts = [
      card.mana_cost,
      ...card.card_faces.map((it) => it.mana_cost),
    ]
      .filter((it) => it !== undefined)
      .map((cost) =>
        cost
          .toLowerCase()
          .slice(1, cost.length - 1)
          .split('}{')
          .sort()
      )
      .filter((rawCost) => {
        const cost = toManaCost(rawCost)
        switch (operator) {
          case '=':
            return isEqual(cost, targetCost)
          case '!=':
          case '<>':
            return !isEqual(cost, targetCost)
          case '<':
            return (
              entries.filter(([key, val]) => cost[key] < val).length > 0 &&
              entries.filter(([key, val]) => cost[key] > val).length === 0
            )
          case '<=':
            return entries.filter(([key, val]) => cost[key] > val).length === 0
          case '>':
            return (
              entries.filter(([key, val]) => cost[key] > val).length > 0 &&
              entries.filter(([key, val]) => cost[key] < val).length === 0
            )
          case ':':
          case '>=':
            return entries.filter(([key, val]) => cost[key] < val).length === 0
        }
      })
    return cardCosts.length > 0
  }

const formatMatch = (legality: Legality, value: Format) => (card: NormedCard) =>
  card.legalities[value] === (legality as unknown as string)

const unimplemented = false
const isVal =
  (value: IsValue): Filter<NormedCard> =>
  (card: NormedCard) => {
    switch (value) {
      case 'gold':
        return (card.colors?.length ?? 0) >= 2
      case 'hybrid':
      case 'phyrexian':
        return unimplemented
      case 'promo':
        return card.printings.find((it) => it.promo) !== undefined
      case 'reprint':
        return card.printings.find((it) => it.reprint) !== undefined
      case 'firstprint':
      case 'firstprinting':
        return unimplemented // Add when processing multiple prints
      case 'digital':
        return card.printings.find((it) => it.digital) !== undefined
      case 'dfc':
        return DOUBLE_FACED_LAYOUTS.includes(card.layout)
      case 'mdfc':
        return card.layout === 'modal_dfc'
      case 'meld':
        return card.layout === 'meld'
      case 'tdfc':
      case 'transform':
        return card.layout === 'transform'
      case 'split':
        return card.layout === 'split'
      case 'flip':
        return card.layout === 'flip'
      case 'leveler':
        return card.layout === 'leveler'
      case 'commander':
        return (
          card.type_line.toLowerCase().includes('legendary creature') ||
          anyFaceContains(
            card,
            'oracle_text',
            `${card.name} can be your commander.`
          )
        )
      case 'spell':
        return (
          ['land', 'token'].filter((type) =>
            card.type_line.toLowerCase().includes(type)
          ).length === 0
        )
      case 'permanent':
        return (
          ['instant', 'sorcery'].filter((type) =>
            card.type_line.toLowerCase().includes(type)
          ).length === 0
        )
      case 'historic':
        return (
          ['legendary', 'artifact', 'saga'].filter((type) =>
            card.type_line.toLowerCase().includes(type)
          ).length > 0
        )
      case 'vanilla':
        return (
          card.oracle_text?.length === 0 ||
          card.card_faces.filter((i) => i.oracle_text.length === 0).length > 0
        )
      case 'modal':
        return /chooses? (\S* or \S*|(up to )?(one|two|three|four|five))( or (more|both)| that hasn't been chosen)?( —|\.)/.test(
          card.oracle_text?.toLowerCase()
        )
      case 'fullart':
      case 'foil':
      case 'nonfoil':
      case 'etched':
        return unimplemented // Add when processing multiple prints
      case 'token':
        return card.layout === 'token' || card.type_line.includes('Token')
      case 'bikeland':
      case 'cycleland':
      case 'bicycleland':
        return (
          hasNumLandTypes(card, 2) && card.oracle_text?.includes('Cycling {2}')
        )
      case 'bounceland':
      case 'karoo':
        return (
          /Add \{.}\{.}\./.test(card.oracle_text) &&
          (/When .* enters the battlefield, sacrifice it unless you return an untapped/.test(
            card.oracle_text
          ) ||
            /When .* enters the battlefield, return a land you control to its owner's hand/.test(
              card.oracle_text
            ))
        )
      case 'canopyland':
      case 'canland':
        return /Pay 1 life: Add \{.} or \{.}\.\n\{1}, \{T}, Sacrifice/m.test(
          card.oracle_text
        )
      case 'fetchland':
        return /\{T}, Pay 1 life, Sacrifice .*: Search your library for an? .* or .* card, put it onto the battlefield, then shuffle/.test(
          card.oracle_text
        )
      case 'checkland':
        return (
          isDual(card) &&
          /.* enters the battlefield tapped unless you control an? .* or an? *./.test(
            card.oracle_text
          )
        )
      case 'dual':
        return (
          hasNumLandTypes(card, 2) &&
          noReminderText(card.oracle_text?.toLowerCase()).length === 0
        )
      case 'fastland':
        return (
          isDual(card) &&
          /.* enters the battlefield tapped unless you control two or fewer other lands\./.test(
            card.oracle_text
          )
        )
      case 'filterland':
        return (
          card.type_line.includes('Land') &&
          (/\{T}: Add \{C}\.\n{.\/.}, \{T}: Add \{.}{.}, \{.}\{.}, or \{.}\{.}\./m.test(
            card.oracle_text
          ) ||
            /\{1}, \{T}: Add \{.}\{.}\./.test(card.oracle_text))
        )
      case 'gainland':
        return (
          isDual(card) &&
          /.* enters the battlefield tapped\./.test(card.oracle_text) &&
          /When .* enters the battlefield, you gain 1 life\./.test(
            card.oracle_text
          )
        )
      case 'painland':
        return (
          card.type_line.includes('Land') &&
          /\{T}: Add {C}\./.test(card.oracle_text) &&
          /\{T}: Add {.} or {.}\. .* deals 1 damage to you\./.test(
            card.oracle_text
          )
        )
      case 'scryland':
        return (
          isDual(card) &&
          /When .* enters the battlefield, scry 1/.test(card.oracle_text)
        )
      case 'shadowland':
      case 'snarl':
        return (
          isDual(card) &&
          /As .* enters the battlefield, you may reveal an? .* or .* card from your hand\. If you don't, .* enters the battlefield tapped./.test(
            card.oracle_text
          )
        )
      case 'shockland':
        return (
          hasNumLandTypes(card, 2) && SHOCKLAND_REGEX.test(card.oracle_text)
        )
      case 'storageland':
        return (
          card.type_line.includes('Land') &&
          /storage counter/.test(card.oracle_text)
        )
      case 'manland':
      case 'creatureland':
        return (
          card.type_line.includes('Land') &&
          new RegExp(`(${card.name}|it) becomes? an? .* creature`).test(
            card.oracle_text
          )
        )
      case 'triland':
        return (
          card.type_line.includes('Land') &&
          hasNumLandTypes(card, 0) &&
          /\{T}: Add {.}, \{.}, or {.}\./.test(card.oracle_text)
        )
      case 'triome':
        return (
          card.type_line.includes('Land') &&
          hasNumLandTypes(card, 3) &&
          /\{T}: Add {.}, \{.}, or {.}\./.test(card.oracle_text)
        )
      case 'tangoland':
      case 'battleland':
        return (
          card.type_line.includes('Land') &&
          hasNumLandTypes(card, 2) &&
          /.* enters the battlefield tapped unless you control two or more basic lands\./.test(
            card.oracle_text
          )
        )
      case 'slowland':
        return (
          isDual(card) &&
          /.* enters the battlefield tapped unless you control two or more other lands\./.test(
            card.oracle_text
          )
        )
      case 'extra':
        return unimplemented
      default:
        return unimplemented
    }
  }

const inFilter =
  (value: string): Filter<NormedCard> =>
    (it) =>
      it.printings.filter(printFilters.setFilter(value)).length > 0

const rarityFilter = (operator: Operator, value: string): FilterRes<NormedCard> => ({
  filtersUsed: ["rarity"],
  filterFunc: (it) => it.printings.find(printFilters.rarityFilter(operator, value)) !== undefined,
  inverseFunc: (it) => it.printings.find(not(printFilters.rarityFilter(operator, value))) !== undefined
})

const setFilter = (value: string): FilterRes<NormedCard> => ({
  filtersUsed: ["set"],
  filterFunc: (it) => it.printings.find(printFilters.setFilter(value)) !== undefined,
  inverseFunc: (it) => it.printings.find(not(printFilters.setFilter(value))) !== undefined,
})

const setTypeFilter = (value: string): FilterRes<NormedCard> => ({
  filtersUsed: ["set-type"],
  filterFunc: (it) => it.printings.find(printFilters.setTypeFilter(value)) !== undefined,
  inverseFunc: (it) => it.printings.find(not(printFilters.setTypeFilter(value))) !== undefined,
})

const artistFilter = (value: string): FilterRes<NormedCard> => ({
  filtersUsed: ["artist"],
  filterFunc: (it) => it.printings.find(printFilters.artistFilter(value)) !== undefined,
  inverseFunc: (it) => it.printings.find(not(printFilters.artistFilter(value))) !== undefined
})

const collectorNumberFilter = (operator: Operator, value: number): FilterRes<NormedCard> => ({
    filtersUsed: ["collector-number"],
    filterFunc: (it) => it.printings
      .find(printFilters.collectorNumberFilter(operator, value)) !== undefined,
    inverseFunc: (it) => it.printings
      .find(not(printFilters.collectorNumberFilter(operator, value))) !== undefined,
  })

const borderFilter =
  (value: string): FilterRes<NormedCard> => ({
    filtersUsed: ["border"],
    filterFunc: (it) => it.printings
      .find(printFilters.borderFilter(value)) !== undefined,
    inverseFunc: (it) => it.printings
      .find(not(printFilters.borderFilter(value))) !== undefined,
  })

const dateFilter =
  (operator: Operator, value: string): FilterRes<NormedCard> => ({
    filtersUsed: ["date"],
    filterFunc: (it) => it.printings
      .find(printFilters.dateFilter(operator, value)) !== undefined,
    inverseFunc: (it) => it.printings
      .find(not(printFilters.dateFilter(operator, value))) !== undefined,
  })

const priceFilter =
  (unit: string, operator: Operator, value: number): FilterRes<NormedCard> => ({
    filtersUsed: [unit],
    filterFunc: (it) => it.printings
      .find(printFilters.priceFilter(unit, operator, value)) !== undefined,
    inverseFunc: (it) => it.printings
      .find(not(printFilters.priceFilter(unit, operator, value))) !== undefined,
  })

const frameFilter =
  (value: string): FilterRes<NormedCard> => ({
    filtersUsed: ["frame"],
    filterFunc: (it) => it.printings
      .find(printFilters.frameFilter(value)) !== undefined,
    inverseFunc: (it) => it.printings
      .find(not(printFilters.frameFilter(value))) !== undefined,
  })

const flavorMatch = (value: string): FilterRes<NormedCard> => ({
  filtersUsed: ["flavor"],
  filterFunc: (it) => it.printings
    .find(printFilters.flavorMatch(value)) !== undefined,
  inverseFunc: (it) => it.printings
    .find(not(printFilters.flavorMatch(value))) !== undefined,
})

const flavorRegex = (value: string): FilterRes<NormedCard> => ({
  filtersUsed: ["flavor"],
  filterFunc: (it) => it.printings
    .find(printFilters.flavorRegex(value)) !== undefined,
  inverseFunc: (it) => it.printings
    .find(not(printFilters.flavorRegex(value))) !== undefined,
})

export const oracleFilters = {
  identity: identityRes,
  and: andRes,
  or: orRes,
  not: notRes,
  defaultOperation,
  powTouOperation,
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
  rarityFilter,
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
}
