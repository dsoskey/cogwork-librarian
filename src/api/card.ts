import { Card } from 'scryfall-sdk'
import { ObjectValues } from '../types'
import mapValues from 'lodash/mapValues'
import cloneDeep from 'lodash/cloneDeep'
import { NormedCard, OracleKeys } from './local/normedCard'

export const DOUBLE_FACED_LAYOUTS = [
  'transform',
  'modal_dfc',
  'meld',
  'double_sided',
  'double_faced_token',
]

export const BASIC_LAND_TYPES = [
  'plains',
  'island',
  'swamp',
  'mountain',
  'forest',
]

export const SHOCKLAND_REGEX =
  /As .* enters the battlefield, you may pay 2 life. If you don't, it enters the battlefield tapped\./

export const isValues = {
  gold: 'gold',
  hybrid: 'hybrid',
  phyrexian: 'phyrexian',
  promo: 'promo',
  reprint: 'reprint',
  firstprint: 'firstprint',
  firstprinting: 'firstprinting',
  digital: 'digital',
  dfc: 'dfc',
  mdfc: 'mdfc',
  tdfc: 'tdfc',
  meld: 'meld',
  transform: 'transform',
  split: 'split',
  flip: 'flip',
  leveler: 'leveler',
  commander: 'commander',
  spell: 'spell',
  permanent: 'permanent',
  historic: 'historic',
  vanilla: 'vanilla',
  modal: 'modal',
  fullart: 'fullart',
  foil: 'foil',
  nonfoil: 'nonfoil',
  etched: 'etched',
  token: 'token',
  bikeland: 'bikeland',
  cycleland: 'cycleland',
  bicycleland: 'bicycleland',
  bounceland: 'bounceland',
  karoo: 'karoo',
  canopyland: 'canopyland',
  canland: 'canland',
  fetchland: 'fetchland',
  checkland: 'checkland',
  dual: 'dual',
  fastland: 'fastland',
  filterland: 'filterland',
  gainland: 'gainland',
  painland: 'painland',
  scryland: 'scryland',
  shadowland: 'shadowland',
  snarl: 'snarl',
  slowland: 'slowland',
  shockland: 'shockland',
  storageland: 'storageland',
  creatureland: 'creatureland',
  manland: 'manland',
  triland: 'triland',
  triome: 'triome',
  tangoland: 'tangoland',
  battleland: 'battleland',
  extra: 'extra',
} as const
export type IsValue = ObjectValues<typeof isValues>

const MANA_SYMBOLS = {
  generic: 'generic',
  w: 'w',
  u: 'u',
  b: 'b',
  r: 'r',
  g: 'g',
  c: 'c',
  s: 's',
  x: 'x',
  y: 'y',

  'w/u': 'w/u',
  'w/b': 'w/b',
  'w/r': 'w/r',
  'w/g': 'w/g',

  'u/w': 'u/w',
  'u/b': 'u/b',
  'u/r': 'u/r',
  'u/g': 'u/g',

  'b/w': 'b/w',
  'b/u': 'b/u',
  'b/r': 'b/r',
  'b/g': 'b/g',

  'r/w': 'r/w',
  'r/u': 'r/u',
  'r/b': 'r/b',
  'r/g': 'r/g',

  'g/w': 'g/w',
  'g/u': 'g/u',
  'g/r': 'g/r',
  'g/b': 'g/b',

  'w/p': 'w/p',
  'u/p': 'u/p',
  'b/p': 'b/p',
  'r/p': 'r/p',
  'g/p': 'g/p',
  'p/w': 'p/w',
  'p/u': 'p/u',
  'p/b': 'p/b',
  'p/r': 'p/r',
  'p/g': 'p/g',

  'w/2': 'w/2',
  'u/2': 'u/2',
  'b/2': 'b/2',
  'r/2': 'r/2',
  'g/2': 'g/2',
  '2/w': '2/w',
  '2/u': '2/u',
  '2/b': '2/b',
  '2/r': '2/r',
  '2/g': '2/g',
} as const
export type ManaSymbol = ObjectValues<typeof MANA_SYMBOLS>

// manaSymbol -> total count of that type of mana
export type ManaCost = Record<ManaSymbol, number>
export const emptyCost: ManaCost = mapValues(MANA_SYMBOLS, () => 0)

export const manaAliases: Record<ManaSymbol, ManaSymbol> = {
  '2/b': '2/b',
  '2/g': '2/g',
  '2/r': '2/r',
  '2/u': '2/u',
  '2/w': '2/w',
  'b/2': '2/b',
  'b/p': 'b/p',
  'g/2': '2/g',
  'g/p': 'g/p',
  'p/b': 'b/p',
  'p/g': 'g/p',
  'p/r': 'r/p',
  'p/u': 'u/p',
  'p/w': 'w/p',
  'r/2': '2/r',
  'r/p': 'r/p',
  'u/2': '2/u',
  'u/p': 'u/p',
  'w/2': '2/w',
  'w/p': 'w/p',
  'b/g': 'b/g',
  'b/r': 'b/r',
  'b/u': 'u/b',
  'b/w': 'w/b',
  'g/b': 'b/g',
  'g/r': 'r/g',
  'g/u': 'u/g',
  'g/w': 'w/g',
  'r/b': 'b/r',
  'r/g': 'r/g',
  'r/u': 'u/r',
  'r/w': 'w/r',
  'u/b': 'u/b',
  'u/g': 'u/g',
  'u/r': 'u/r',
  'u/w': 'w/u',
  'w/b': 'w/b',
  'w/g': 'w/g',
  'w/r': 'w/r',
  'w/u': 'w/u',
  x: 'x',
  y: 'y',
  generic: 'generic',
  w: 'w',
  u: 'u',
  b: 'b',
  r: 'r',
  g: 'g',
  c: 'c',
  s: 's',
}

export const toManaCost = (rawCost: string[]): ManaCost => {
  const result: ManaCost = cloneDeep(emptyCost)
  rawCost.forEach((rawSymbol) => {
    // hybrids are considered NaN
    const asNum = rawSymbol.includes('/') ? NaN : Number.parseInt(rawSymbol, 10)
    if (Number.isNaN(asNum)) {
      result[manaAliases[rawSymbol]] += 1
    } else {
      result.generic += asNum
    }
  })
  return result
}

export const isDual = (card: Card | NormedCard) =>
  card.type_line.includes('Land') && /Add \{.} or \{.}\./.test(card.oracle_text)
export const hasNumLandTypes = (card: Card | NormedCard, num: number) =>
  BASIC_LAND_TYPES.filter((type) => card.type_line.toLowerCase().includes(type))
    .length === num

export const anyFaceContains = (
  card: Card | NormedCard,
  field: OracleKeys,
  value: string,
  fieldTransform: (string) => string = (it) => it
): boolean =>
  fieldTransform(card[field]?.toString().toLowerCase() ?? '').includes(value) ||
  card.card_faces.filter((face) =>
    fieldTransform(face[field]?.toString().toLowerCase() ?? '').includes(value)
  ).length > 0

export const anyFaceRegexMatch = (
  card: Card | NormedCard,
  field: OracleKeys,
  regex: RegExp,
  fieldTransform: (string) => string = (it) => it
): boolean =>
  (card[field] !== undefined
    ? regex.test(fieldTransform(card[field].toString().toLowerCase()))
    : false) ||
  card.card_faces.filter((face) =>
    face[field] !== undefined
      ? regex.test(fieldTransform(face[field].toString().toLowerCase()))
      : false
  ).length > 0
export const noReminderText = (text: string): string =>
  text.replace(/\(.*\)/gi, '')
