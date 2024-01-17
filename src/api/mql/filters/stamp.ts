import { FilterNode } from './base'
import { printNode } from './print'

export const stampFilter = (value: string): FilterNode =>
  printNode(['stamp'], ({ printing }) =>
    printing.security_stamp !== undefined
      ? printing.security_stamp.toString() === value
      : false)