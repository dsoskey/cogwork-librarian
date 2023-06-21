import { Filter, FilterNode } from './base'
import { printNode } from './print'
import { PrintingFilterTuple } from '../types/normedCard'

export const gameFilter = (value: string): Filter<PrintingFilterTuple> =>
  ({ printing }) => printing.games.find((game) => game === value) !== undefined

export const gameNode = (value: string): FilterNode =>
  printNode(['game'], gameFilter(value))
