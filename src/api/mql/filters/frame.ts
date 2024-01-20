import { Filter, FilterNode } from './base'
import { printNode } from './print'
import { PrintingFilterTuple } from '../types/normedCard'

export const frameFilter = (value: string): Filter<PrintingFilterTuple> =>
  ({ printing }) => printing.frame === value

export const frameNode = (value: string): FilterNode =>
  printNode(['frame'], frameFilter(value))
