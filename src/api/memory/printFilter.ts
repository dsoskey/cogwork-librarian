import {
  identity,
  Filter,
  FilterRes,
  identityRes,
  andRes,
  orRes,
  notRes,
  defaultCompare,
} from './filterBase'
import { Printing } from '../local/normedCard'
import { Operator } from './oracleFilter'
import { Rarity } from 'scryfall-sdk/out/api/Cards'

export const showAllFilter = new Set(['date', 'frame', 'rarity', 'set', 'setType', 'usd', 'eur', 'tix'])

const oracleFilter = (): FilterRes<Printing> => ({
  ...identityRes(),
  inverseFunc: identity(),
})

const rarityFilter =
  (operator: Operator, value: string): Filter<Printing> =>
  (it: Printing) => {
    switch (operator) {
      case '=':
      case ':':
        return it.rarity === value
      case '!=':
      case '<>':
        return it.rarity !== value
      case '>':
        return Rarity[it.rarity] > Rarity[value]
      case '>=':
        return Rarity[it.rarity] >= Rarity[value]
      case '<':
        return Rarity[it.rarity] < Rarity[value]
      case '<=':
        return Rarity[it.rarity] <= Rarity[value]
    }
  }

const setFilter =
  (value: string): Filter<Printing> =>
  (it) => it.set === value || it.set_name.toLowerCase() === value

const setTypeFilter =
  (value: string): Filter<Printing> =>
  (it) => it.set_type === value

const artistFilter =
  (value: string): Filter<Printing> =>
  (it) => it.artist.toLowerCase().includes(value)

const collectorNumberFilter =
  (operator: Operator, value: number): Filter<Printing> =>
  (it) => {
    const printCN = parseInt(it.collector_number, 10)
    return defaultCompare(printCN, operator, value)
  }

const borderFilter =
  (value: string): Filter<Printing> =>
  (it) => it.border_color === value

const dateFilter = (operator: Operator, value: string): Filter<Printing> => {
  const valueDate = new Date(value)
  return (it) => {
    const printDate = new Date(it.released_at)
    if (isNaN(valueDate.getTime())) {
      throw `${value} must fit date format yyyy-MM-dd`
    }
    if (isNaN(printDate.getTime())) {
      throw `printing ${it.id} has a malformed released_at date. check your database for corruption.`
    }

    return defaultCompare(printDate, operator, valueDate)
  }
}

const priceFilter = (unit: string, operator: Operator, value: number): Filter<Printing> => (it) => {
  const printPrice = it.prices[unit]
  if (printPrice === null || printPrice === undefined) {
    return false
  }
  // should this throw an error if value is NaN? this can happen for `tix<=`
  return defaultCompare(Number.parseFloat(printPrice), operator, value)
}

const frameFilter = (value: string): Filter<Printing> => it => it.frame === value

// TODO; deal with multi-face print-specific on everything that's relevant
const flavorMatch = (value: string): Filter<Printing> => it => {
  return it.flavor_text?.toLowerCase().includes(value) ||
  it.card_faces.filter(it => it.flavor_text?.toLowerCase().includes(value)).length > 0
}

const flavorRegex = (value: string): Filter<Printing> => it => {
  const regexp = new RegExp(value)
  return regexp.test(it.flavor_text) ||
    it.card_faces.filter(face => regexp.test(face.flavor_text)).length > 0
}
export const printFilters = {
  identity: identityRes,
  and: andRes,
  or: orRes,
  not: notRes,
  rarityFilter,
  setFilter,
  setTypeFilter,
  artistFilter,
  oracleFilter,
  collectorNumberFilter,
  borderFilter,
  dateFilter,
  priceFilter,
  frameFilter,
  flavorMatch,
  flavorRegex,
}
