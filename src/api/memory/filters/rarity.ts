import { FilterNode, defaultCompare, Operator } from './base'
import { printNode } from './print'
import { Rarity } from 'scryfall-sdk/out/api/Cards'
import { PrintingFilterTuple } from '../types/normedCard'

export const rarityFilterNode = (operator: Operator, value: string): FilterNode =>
  printNode(['rarity'], ({ printing }: PrintingFilterTuple) => defaultCompare(Rarity[printing.rarity], operator, Rarity[value]))
