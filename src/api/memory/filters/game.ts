import { FilterNode } from './base'
import { printNode } from './oracle'

export const gameFilter = (value: string): FilterNode =>
  printNode(['game'], (it) =>
    it.games.find((game) => game === value) !== undefined)
