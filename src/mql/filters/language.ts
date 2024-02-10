import { Filter, FilterNode } from './base'
import { printNode } from './print'
import { PrintingFilterTuple } from '../types/normedCard'

export const languageFilter = (value: string): Filter<PrintingFilterTuple> =>
  ({ printing }) => {
    if (value === 'any') {
      return true
    }
    return printing.lang === value
  }

export const languageNode = (value: string): FilterNode =>
  printNode(['language'], languageFilter(value))
