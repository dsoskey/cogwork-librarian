import { FilterNode } from './base'
import { printNode } from './print'

export const watermarkFilter = (value: string): FilterNode =>
  printNode(['watermark'], (it) => it.watermark === value)