import { Filter, FilterNode } from './base'
import { printNode } from './oracle'
import { Printing } from '../types/normedCard'

export const gameFilter = (value: string): Filter<Printing> =>
  (it) => it.games.find((game) => game === value) !== undefined

export const gameNode = (value: string): FilterNode =>
  printNode(['game'], gameFilter(value))
