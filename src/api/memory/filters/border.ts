import { FilterNode } from './base'
import { printNode } from './print'

export const borderNode = (value: string): FilterNode =>
  printNode(['border'], (it) => it.border_color === value)
