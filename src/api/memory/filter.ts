import { Card } from 'scryfall-sdk'
import { CardKeys } from '../local/db'
import {
  anyFaceContains,
  anyFaceRegexMatch,
  DOUBLE_FACED_LAYOUTS,
  hasNumLandTypes,
  isDual,
  IsValue,
  noReminderText,
  SHOCKLAND_REGEX,
} from '../card'

export type Filter<T> = (T) => boolean

export type EqualityOperator = ':' | '='

export type Operator = EqualityOperator | '!=' | '<>' | '<' | '<=' | '>' | '>='

// these should go on the card object itself
export const parsePowTou = (value: any) =>
  value !== undefined
    ? Number.parseInt(value.toString().replace('*', '0'), 10)
    : 0

const replaceNamePlaceholder = (text: string, name: string): string => {
  return text.replace(/~/g, name).toLowerCase()
}

// TODO: handle card faces for all filters
export class MemoryFilterWrapper {
  constructor() {}

  identity = (): Filter<Card> => (_) => true

  and = (clause1: Filter<Card>, clause2: Filter<Card>): Filter<Card> => {
    return (c: Card) => clause1(c) && clause2(c)
  }

  or = (clause1: Filter<Card>, clause2: Filter<Card>): Filter<Card> => {
    return (c: Card) => clause1(c) || clause2(c)
  }

  not = (clause: Filter<Card>): Filter<Card> => {
    return (c: Card) => !clause(c)
  }

  defaultOperation =
    (field: CardKeys, operator: Operator, value: any): Filter<Card> =>
    (card: Card) => {
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

  powTouOperation =
    (field: CardKeys, operator: Operator, targetValue: number): Filter<Card> =>
    (card: Card) => {
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

  textMatch =
    (field: CardKeys, value: string): Filter<Card> =>
    (card: Card) =>
      anyFaceContains(card, field, replaceNamePlaceholder(value, card.name))

  regexMatch =
    (field: CardKeys, value: string): Filter<Card> =>
    (card: Card) =>
      anyFaceRegexMatch(
        card,
        field,
        new RegExp(replaceNamePlaceholder(value, card.name))
      )

  colorMatch =
    (operator: Operator, value: Set<string>): Filter<Card> =>
    (card: Card) => {
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
            faceMatchMap.filter((it) => it.match.length === value.size).length >
            0
          )
        case '<>':
          throw 'throw something better please!'
      }
    }

  colorIdentityMatch =
    (operator: Operator, value: Set<string>): Filter<Card> =>
    (card: Card) => {
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

  unimplemented = false
  isVal =
    (value: IsValue): Filter<Card> =>
    (card: Card) => {
      switch (value) {
        case 'gold':
          return (card.colors?.length ?? 0) >= 2
        case 'hybrid':
        case 'phyrexian':
          return this.unimplemented
        case 'promo':
          return card.promo
        case 'reprint':
          return card.reprint
        case 'firstprint':
        case 'firstprinting':
          return this.unimplemented // Add when processing multiple prints
        case 'digital':
          return card.digital
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
          return this.unimplemented // Add when processing multiple prints
        case 'token':
          return card.layout === 'token' || card.type_line.includes('Token')
        case 'bikeland':
        case 'cycleland':
        case 'bicycleland':
          return (
            hasNumLandTypes(card, 2) &&
            card.oracle_text?.includes('Cycling {2}')
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
          return (
            ['wc97', 'wc98', 'wc99', 'wc00', 'wc01', 'wc02', 'wc03', 'wc04',
              'tfth', 'tbth', 'tdag', 'thp3', 'thp2', 'thp1',
              'olep', 'pcel', 'psdg', '30a', 'past'].includes(card.set.toLowerCase()) ||
            /(^|\b)(vanguard|plane|scheme|phenomenon|token|card|emblem)(\b|$)/.test(card.type_line.toLowerCase()) ||
              card.set_type === 'memorabilia'
          )
        default:
          return this.unimplemented
      }
    }
}

export const Filters = new MemoryFilterWrapper()
