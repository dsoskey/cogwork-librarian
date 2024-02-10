import { FilterNode } from './base'
import { printNode } from './print'

export const borderNode = (value: string): FilterNode =>
  printNode(['border'], ({ printing }) => printing.border_color === value)
