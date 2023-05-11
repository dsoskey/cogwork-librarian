import { FilterNode } from './base'
import { printNode } from './oracle'

export const languageFilter = (value: string): FilterNode =>
  printNode(['language'], (it) => {
    if (value === 'any') {
      return true
    }
    return it.lang === value
  })
