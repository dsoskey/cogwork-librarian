import { Filter, FilterRes, not } from '../filterBase'
import { NormedCard, Printing } from '../types/normedCard'

export const handlePrint = (
  filtersUsed: string[],
  printFilter: Filter<Printing>
): FilterRes<NormedCard> => ({
  filtersUsed,
  filterFunc: (it) => it.printings.find(printFilter) !== undefined,
  inverseFunc: (it) => it.printings.find(not(printFilter)) !== undefined,
})