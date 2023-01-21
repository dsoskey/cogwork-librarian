import { Card } from 'scryfall-sdk'
import { ObjectValues } from '../types'

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
} as const
export type IsValue = ObjectValues<typeof isValues>

export const isDual = (card: Card) =>
  card.type_line.includes('Land') && /Add \{.} or \{.}\./.test(card.oracle_text)
export const hasNumLandTypes = (card: Card, num: number) =>
  BASIC_LAND_TYPES.filter((type) => card.type_line.toLowerCase().includes(type))
    .length === num

export const oracleTextContains = (card: Card, value: string): boolean =>
  card.oracle_text.toLowerCase().includes(value) ||
  card.card_faces.filter((face) =>
    face.oracle_text.toLowerCase().includes(value)
  ).length > 0

export const noReminderText = (text: string): string =>
  text.replace(/\(.*\)/, '')
