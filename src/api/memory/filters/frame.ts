import { FilterNode } from './base'
import { printNode } from './oracle'

export const frameNode = (value: string): FilterNode =>
  printNode(['flavor'], (it) => it.frame === value)
