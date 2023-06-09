import { defaultCompare, FilterNode, Operator } from './base'
import { printNode } from './print'

export const collectorNumberNode = (operator: Operator, value: number): FilterNode =>
  printNode(['collector-number'], (it) => {
    const printCN = parseInt(it.collector_number, 10)
    return defaultCompare(printCN, operator, value)
  })