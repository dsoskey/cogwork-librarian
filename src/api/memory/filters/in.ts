import { FilterNode } from './base'
import { NormedCard } from '../types/normedCard'
import { printFilters } from '../printFilter'

export const inFilter =
  (value: string): FilterNode<NormedCard> => ({
    filtersUsed: ["in"],
    filterFunc: (it) =>
      it.printings.filter(printFilters.setFilter(value)).length > 0
  })