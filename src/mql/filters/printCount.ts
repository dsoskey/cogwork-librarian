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

export const paperPrintCount = (operator: Operator, count: number) : FilterNode => {
  return oracleNode({
    filtersUsed: ['paperprints'],
    filterFunc: (card) => {
      return defaultCompare(card.printings.filter(it => !it.digital).length, operator, count)
    }
  })
}