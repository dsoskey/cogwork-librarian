import { Filter, FilterNode } from './base'
import { printNode } from './oracle'
import { Printing } from '../types/normedCard'

export const setFilter = (value: string): Filter<Printing> =>
(it) => it.set === value || it.set_name.toLowerCase() === value

export const setNode = (value: string): FilterNode =>
  printNode(['set'], setFilter(value))

export const setTypeFilter = (value: string): Filter<Printing> =>
(it) => it.set_type === value

export const setTypeNode = (value: string): FilterNode =>
  printNode(['set-type'], setTypeFilter(value))
