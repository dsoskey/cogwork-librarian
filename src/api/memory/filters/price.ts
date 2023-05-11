import { defaultCompare, FilterNode, Operator } from './base'
import { printNode } from './oracle'

export const priceNode = (unit: string, operator: Operator, value: number): FilterNode =>
  printNode([unit], (it) => {
    const printPrice = it.prices[unit]
    if (printPrice === null || printPrice === undefined) {
      return false
    }
    // should this throw an error if value is NaN? this can happen for `tix<=`
    return defaultCompare(Number.parseFloat(printPrice), operator, value)
  })