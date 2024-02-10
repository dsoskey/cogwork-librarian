import { ObjectValues } from '../types/common'
import { Card, Rarity } from 'scryfall-sdk'
import { parsePowTou } from '../types/card'

const SORT_ORDERS = {
  artist: 'artist',
  cmc: 'cmc',
  color: 'color',
  edhrec: 'edhrec',
  eur: 'eur',
  name: 'name',
  penny: 'penny',
  power: 'power',
  rarity: 'rarity',
  released: 'released',
  review: 'review',
  set: 'set',
  spoiled: 'spoiled',
  tix: 'tix',
  toughness: 'toughness',
  usd: 'usd'
} as const
export type SortOrder = ObjectValues<typeof SORT_ORDERS>

export const sortFunc = (key: SortOrder): any[] => {
  switch (key) {
    case 'name':
      return [byName]
    case 'artist':
    case 'cmc':
      return [key]
    case 'set':
      return ['set', byCollectorNumber]
    case 'spoiled':
      return [bySpoiled]
    case 'released':
      return [byReleased]
    case 'usd':
      return [byUsd]
    case 'tix':
      return [byTix]
    case 'eur':
      return [byEur]
    case 'edhrec':
      return [byEdhrecRank]
    case 'penny':
      return [byPennyRank]
    case 'power':
    case 'toughness':
      return [byPowTou(key)]
    case 'rarity':
      return [byRarity]
    case 'color':
      return [byColor]
    case 'review':
      return [byColor, 'cmc']
  }
}

function byCollectorNumber(card: Card) {
  return Number.parseInt(card.collector_number, 10)
}

function bySpoiled(card: Card) {
  return new Date(card.preview?.previewed_at ?? card.released_at)
}

function byReleased(card: Card) {
  return new Date(card.released_at)
}

const colorOrder = {
  W: 0,
  U: 1,
  B: 2,
  R: 3,
  G: 4,
  UW: 5,
  BU: 6,
  BR: 7,
  GR: 8,
  GW: 9,
  BW: 10,
  RU: 11,
  BG: 12,
  RW: 13,
  GU: 14,
  BUW: 15,
  BRU: 16,
  BGR: 17,
  GRW: 18,
  GUW: 19,
  BRW: 20,
  GRU: 21,
  BGW: 22,
  RUW: 23,
  BGU: 24,
  BRUW: 25,
  BGRU: 26,
  BGRW: 27,
  GRUW: 28,
  BGUW: 29,
  BGRUW: 30,
  "": 31,
}

export function byName(card:Card) {
  return card.name.toLowerCase().replace(/( |\B|-)/g, "");
}

function byColor(card: Card) {
  const colors = Array.from(new Set(card.colors ?? card.card_faces.flatMap(face => face.colors)))
  const sorted = colors.sort().join('')
  return colorOrder[sorted]
}

function byRarity(card: Card) {
  return Rarity[card.rarity]
}

function byPowTou(key: 'power' | 'toughness') {
  return (card: Card) => parsePowTou(card[key])
}

function byPennyRank(card: Card) {
// @ts-ignore
  return card.penny_rank ?? 0
}

function byEdhrecRank(card: Card) {
  return card.edhrec_rank ?? 0
}

function byUsd(card: Card) {
  return Number.parseFloat(card.prices.usd ?? card.prices.usd_foil ?? card.prices.usd_etched ?? '0')
}

function byTix(card: Card) {
  return Number.parseFloat(card.prices.tix ?? '0')
}

function byEur(card: Card) {
  return Number.parseFloat(card.prices.eur ?? card.prices.eur_foil ?? '0')
}
