import { CombinedFilterNode, defaultCompare, Filter, FilterNode, identity, identityNode, not, Operator } from './base'
import { NormedCard, OracleKeys, Printing } from '../types/normedCard'

export const oracleFilter = (): FilterNode<Printing> => ({
  ...identityNode(),
  inverseFunc: identity(),
})

export const oracleNode =
  ({ filtersUsed, filterFunc, inverseFunc }: FilterNode<NormedCard>): CombinedFilterNode => ({
    filtersUsed,
    filterFunc,
    inverseFunc,
    printFilter: identity(),
    printInverse: identity(),
  })


export const handlePrint = (
  filtersUsed: string[],
  printFilter: Filter<Printing>
): FilterNode<NormedCard> => ({
  filtersUsed,
  filterFunc: (it) => it.printings.find(printFilter) !== undefined,
  inverseFunc: (it) => it.printings.find(not(printFilter)) !== undefined,
})
export const printNode = (
  filtersUsed: string[],
  printFilter: Filter<Printing>,
): CombinedFilterNode => {
  const { filterFunc, inverseFunc } = handlePrint(filtersUsed, printFilter)
  return {
    filtersUsed,
    filterFunc,
    inverseFunc,
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
