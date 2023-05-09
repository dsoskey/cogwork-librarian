import isEqual from 'lodash/isEqual'
import {
  anyFaceContains,
  anyFaceRegexMatch,
  noReminderText,
  replaceNamePlaceholder,
  toManaCost,
  toSplitCost,
} from './types/card'
import { Format, Legality } from 'scryfall-sdk/out/api/Cards'
import { NormedCard, OracleKeys } from './types/normedCard'
import { ObjectValues } from '../../types'
import {
  Filter,
  andRes,
  identityRes,
  orRes,
  notRes,
  FilterRes,
  defaultCompare,
} from './filters/base'
import { printFilters } from './printFilter'
import { defaultOperation, handlePrint } from './filters/oracle'
import { textMatch } from './filters/text'
import { isVal } from './filters/is'
import { devotionOperation } from './filters/devotion'

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

const powTouTotalOperation = (
  operator: Operator,
  targetValue: number
): FilterRes<NormedCard> => ({
  filtersUsed: ['powtou'],
  filterFunc: (card) => {
    const faces = [
      {
        power: card.power,
        toughness: card.toughness,
      },
      ...card.card_faces.map((jt) => ({
        power: jt.power,
        toughness: jt.toughness,
      })),
    ]

    return (
      faces
        .filter((it) => it.toughness !== undefined && it.power !== undefined)
        .map(
          ({ power, toughness }) => parsePowTou(power) + parsePowTou(toughness)
        )
        .filter((faceValue) => defaultCompare(faceValue, operator, targetValue))
        .length > 0
    )
  },
})

const exactMatch =
  (field: OracleKeys, value: string): Filter<NormedCard> =>
  (card: NormedCard) => {
    return card[field].toString().toLowerCase() === value
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
      case '!=': // ????? This looks wrong
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

const producesMatch =
  (operator: Operator, value: Set<string>): Filter<NormedCard> =>
  (card: NormedCard) => {
    if (card.produced_mana === undefined) return false

    const lower = card.produced_mana.map(it => it.toLowerCase())
    const match = lower.filter(color => value.has(color))
    const matchnt = lower.filter(color => !value.has(color))
    if (card.name === 'Abandoned Outpost') {
      console.log(`match: ${match} not: ${matchnt}`)
    }

    switch (operator) {
      case '=':
        return match.length === value.size && matchnt.length === 0
      case '!=':
        return match.length !== value.size || matchnt.length > 0
      case '<':
        return matchnt.length === 0 && match.length < value.size
      case '<=':
        return matchnt.length === 0 && match.length <= value.size
      case '>':
        return matchnt.length > 0 && match.length === value.size
      // Scryfall adapts ":" to the context. in this context it acts as >=
      case ':':
      case '>=':
        return match.length === value.size
    }
  }

const producesMatchCount =
  (operator: Operator, count: number): Filter<NormedCard> =>
  (card: NormedCard) => {
    const cardCount = card.produced_mana?.length ?? 0

    switch (operator) {
      case '=':
        return cardCount === count
      case '!=':
        return cardCount !== count
      case '<':
        return cardCount < count
      case '<=':
        return cardCount <= count
      case '>':
        return cardCount === count
      // Scryfall adapts ":" to the context. in this context it acts as >=
      case ':':
      case '>=':
        return cardCount === count
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
      .filter((rawCost) => {
        if (rawCost === undefined) return false
        const cost = toManaCost(toSplitCost(rawCost))
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
const inFilter =
  (value: string): Filter<NormedCard> =>
  (it) =>
    it.printings.filter(printFilters.setFilter(value)).length > 0

const rarityFilter = (
  operator: Operator,
  value: string
): FilterRes<NormedCard> =>
  handlePrint(['rarity'], printFilters.rarityFilter(operator, value))

const setFilter = (value: string): FilterRes<NormedCard> =>
  handlePrint(['set'], printFilters.setFilter(value))

const setTypeFilter = (value: string): FilterRes<NormedCard> =>
  handlePrint(['set-type'], printFilters.setTypeFilter(value))

const artistFilter = (value: string): FilterRes<NormedCard> =>
  handlePrint(['artist'], printFilters.artistFilter(value))

const collectorNumberFilter = (
  operator: Operator,
  value: number
): FilterRes<NormedCard> =>
  handlePrint(
    ['collector-number'],
    printFilters.collectorNumberFilter(operator, value)
  )

const borderFilter = (value: string): FilterRes<NormedCard> =>
  handlePrint(['border'], printFilters.borderFilter(value))

const dateFilter = (operator: Operator, value: string): FilterRes<NormedCard> =>
  handlePrint(['date'], printFilters.dateFilter(operator, value))

const priceFilter = (
  unit: string,
  operator: Operator,
  value: number
): FilterRes<NormedCard> =>
  handlePrint([unit], printFilters.priceFilter(unit, operator, value))

const frameFilter = (value: string): FilterRes<NormedCard> =>
  handlePrint(['flavor'], printFilters.frameFilter(value))

const flavorMatch = (value: string): FilterRes<NormedCard> =>
  handlePrint(['flavor'], printFilters.flavorMatch(value))

const flavorRegex = (value: string): FilterRes<NormedCard> =>
  handlePrint(['flavor'], printFilters.flavorRegex(value))

const gameFilter = (value: string) =>
  handlePrint(['game'], printFilters.gameFilter(value))

const languageFilter = (value: string) =>
  handlePrint(['language'], printFilters.languageFilter(value))

const stampFilter = (value: string) =>
  handlePrint(['stamp'], printFilters.stampFilter(value))

const watermarkFilter = (value: string) =>
  handlePrint(['watermark'], printFilters.watermarkFilter(value))

const cubeFilter = (cubeKey: string): FilterRes<NormedCard> => {
  const rawCards = localStorage.getItem(`${cubeKey}.cube.coglib.sosk.watch`)
  if (rawCards === null) {
    console.warn(`Unknown cube key (${cubeKey})`) // todo: tokenize noQuoteString
  }
  const cardSet = new Set<string>(rawCards === null ? [] : JSON.parse(rawCards))
  return {
    filtersUsed: ['cube'],
    filterFunc: (card: NormedCard) => {
      if (rawCards === null) throw Error(`Unknown cube key (${cubeKey})`)
      return cardSet.has(card.oracle_id)
    }
  }
}

export const oracleFilters = {
  identity: identityRes,
  and: andRes,
  or: orRes,
  not: notRes,
  defaultOperation,
  powTouOperation,
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
  gameFilter,
  languageFilter,
  stampFilter,
  watermarkFilter,
  cubeFilter,
  producesMatch,
  producesMatchCount,
  devotionOperation
}
