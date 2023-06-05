import { defaultCompare, FilterNode, Operator } from './base'
import { printNode } from './oracle'
import { Prices } from 'scryfall-sdk/out/api/Cards'

export const priceNode = (unit: keyof Prices, operator: Operator, value: number): FilterNode =>
  printNode([unit], (it) => {
    const printPrice = Number.parseFloat(it.prices[unit])

    if (printPrice === null || printPrice === undefined || Number.isNaN(printPrice)) {
      return false
    }
    // should this throw an error if value is NaN? this can happen for `tix<=`
    return defaultCompare(printPrice, operator, value)
  })