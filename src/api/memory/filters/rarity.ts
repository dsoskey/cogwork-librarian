import { FilterNode, defaultCompare, Operator } from './base'
import { printNode } from './print'
import { Rarity } from 'scryfall-sdk'
import { PrintingFilterTuple } from '../types/normedCard'

export const rarityFilter =
  (operator: Operator, value: string) =>
    ({ printing }: PrintingFilterTuple) => defaultCompare(Rarity[printing.rarity], operator, Rarity[value])

export const rarityFilterNode = (operator: Operator, value: string): FilterNode =>
  printNode(['rarity'], rarityFilter(operator, value))
