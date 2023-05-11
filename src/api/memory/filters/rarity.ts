import { FilterNode, defaultCompare, Filter, Operator } from './base'
import { Printing } from '../types/normedCard'
import { printNode } from './oracle'
import { printFilters } from '../printFilter'
import { Rarity } from 'scryfall-sdk/out/api/Cards'

export const rarityFilter =
  (operator: Operator, value: string): Filter<Printing> =>
    (it: Printing) => defaultCompare(Rarity[it.rarity], operator, Rarity[value])

export const rarityFilterNode = (operator: Operator, value: string): FilterNode =>
  printNode(['rarity'], printFilters.rarityFilter(operator, value))
