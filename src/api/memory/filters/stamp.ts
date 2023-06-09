import { FilterNode } from './base'
import { printNode } from './print'

export const stampFilter = (value: string): FilterNode =>
  printNode(['stamp'], (it) =>
    it.security_stamp !== undefined
      ? it.security_stamp.toString() === value
      : false)