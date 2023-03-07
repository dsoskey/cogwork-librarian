import {
  identity,
  Filter,
  FilterRes,
  identityRes,
  andRes,
  orRes,
  notRes,
} from './filterBase'
import { Printing } from '../local/normedCard'
import { Operator } from './oracleFilter'
import { Rarity } from 'scryfall-sdk/out/api/Cards'

export const printFilterNames = new Set(['rarity', 'set', 'setType'])

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
  (it) =>
    it.set === value || it.set_name.toLowerCase() === value

const setTypeFilter =
  (value: string): Filter<Printing> =>
  (it) =>
    it.set_type === value

export const printFilters = {
  identity: identityRes,
  and: andRes,
  or: orRes,
  not: notRes,
  rarityFilter,
  setFilter,
  setTypeFilter,
  oracleFilter,
}
