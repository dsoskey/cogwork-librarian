import { defaultCompare, Filter, FilterRes, not } from './base'
import { NormedCard, OracleKeys, Printing } from '../types/normedCard'
import { Operator } from '../oracleFilter'

export const defaultOperation =
  (field: OracleKeys, operator: Operator, value: any): Filter<NormedCard> =>
    (card: NormedCard) => {
      const cardValue = card[field]
      if (cardValue === undefined) return false
      return defaultCompare(cardValue, operator, value)
    }

export const handlePrint = (
  filtersUsed: string[],
  printFilter: Filter<Printing>
): FilterRes<NormedCard> => ({
  filtersUsed,
  filterFunc: (it) => it.printings.find(printFilter) !== undefined,
  inverseFunc: (it) => it.printings.find(not(printFilter)) !== undefined,
})