import { FilterNode } from './base'
import { printNode } from './print'

export const frameNode = (value: string): FilterNode =>
  printNode(['frame'], ({ printing }) => printing.frame === value)
