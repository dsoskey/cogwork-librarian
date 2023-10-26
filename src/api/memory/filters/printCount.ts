import { defaultCompare, FilterNode, Operator } from './base'
import { oracleNode } from './oracle'

export const printCountFilter = (operator: Operator, count: number): FilterNode => {
  return oracleNode({
    filtersUsed: ['prints'],
    filterFunc: (card) => {
      return defaultCompare(card.printings.length, operator, count)
    }
  })
}