import { Filter, FilterNode } from './base'
import { printNode } from './print'
import { Printing } from '../types/normedCard'

export const gameFilter = (value: string): Filter<Printing> =>
  (it) => it.games.find((game) => game === value) !== undefined

export const gameNode = (value: string): FilterNode =>
  printNode(['game'], gameFilter(value))
