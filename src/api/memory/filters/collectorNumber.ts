import { defaultCompare, FilterNode, Operator } from './base'
import { printNode } from './print'

export const collectorNumberNode = (operator: Operator, value: number): FilterNode =>
  printNode(['collector-number'], ({ printing }) => {
    const printCN = parseInt(printing.collector_number, 10)
    return defaultCompare(printCN, operator, value)
  })