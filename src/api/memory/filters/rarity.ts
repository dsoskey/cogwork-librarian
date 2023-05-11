import { Filter, FilterNode, Operator } from './base'
import { NormedCard, Printing } from '../types/normedCard'
import { handlePrint } from './oracle'
import { printFilters } from '../printFilter'
import { Rarity } from 'scryfall-sdk/out/api/Cards'

export const rarityFilter =
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

export const rarityFilterNode = (
  operator: Operator,
  value: string
): FilterNode<NormedCard> =>
  handlePrint(['rarity'], printFilters.rarityFilter(operator, value))
