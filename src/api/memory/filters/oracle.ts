import { FilterNode, defaultCompare, Filter, identity, not, Operator } from './base'
import { NormedCard, OracleKeys, Printing } from '../types/normedCard'

export interface OracleFilter {
  filtersUsed: string[]
  filterFunc: Filter<NormedCard>
  inverseFunc?: Filter<NormedCard>
}
export const oracleNode =
  ({ filtersUsed, filterFunc, inverseFunc }: OracleFilter): FilterNode => ({
    filtersUsed,
    filterFunc,
    inverseFunc,
    printFilter: identity(),
    printInverse: identity(),
  })

export const printNode = (
  filtersUsed: string[],
  printFilter: Filter<Printing>,
): FilterNode => {
  return {
    filtersUsed,
    filterFunc: (it) => it.printings.find(printFilter) !== undefined,
    inverseFunc: (it) => it.printings.find(not(printFilter)) !== undefined,
    printFilter,
  }
}

export const defaultOperation =
  (field: OracleKeys, operator: Operator, value: any): Filter<NormedCard> =>
    (card: NormedCard) => {
      const cardValue = card[field]
      if (cardValue === undefined) return false
      return defaultCompare(cardValue, operator, value)
    }
