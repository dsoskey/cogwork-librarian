import { Filter, FilterNode } from './base'
import { printNode } from './print'
import { Printing } from '../types/normedCard'

export const languageFilter = (value: string): Filter<Printing> =>
  (it) => {
    if (value === 'any') {
      return true
    }
    return it.lang === value
  }

export const languageNode = (value: string): FilterNode =>
  printNode(['language'], languageFilter(value))
