import { FilterNode, defaultCompare, Filter, Operator } from './base'
import { Printing } from '../types/normedCard'
import { printNode } from './oracle'
import { Rarity } from 'scryfall-sdk/out/api/Cards'

export const rarityFilterNode = (operator: Operator, value: string): FilterNode =>
  printNode(['rarity'], (it: Printing) => defaultCompare(Rarity[it.rarity], operator, Rarity[value]))
