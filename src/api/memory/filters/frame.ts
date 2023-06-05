import { FilterNode } from './base'
import { printNode } from './oracle'

export const frameNode = (value: string): FilterNode =>
  printNode(['frame'], (it) => it.frame === value)
