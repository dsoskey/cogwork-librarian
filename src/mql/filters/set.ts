import { Filter, FilterNode } from './base'
import { printNode } from './print'
import { PrintingFilterTuple } from '../types/normedCard'

export const setFilter = (value: string): Filter<PrintingFilterTuple> =>
({ printing }) => printing.set === value || printing.set_name.toLowerCase() === value

export const setNode = (value: string): FilterNode =>
  printNode(['set'], setFilter(value))

export const setTypeFilter = (value: string): Filter<PrintingFilterTuple> =>
({ printing }) => printing.set_type === value

export const setTypeNode = (value: string): FilterNode =>
  printNode(['set-type'], setTypeFilter(value))
