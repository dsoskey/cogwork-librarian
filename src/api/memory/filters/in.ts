import { FilterNode } from './base'
import { printFilters } from '../printFilter'
import { oracleNode } from './oracle'

export const inFilter = (value: string): FilterNode =>
  oracleNode({
    filtersUsed: ["in"],
    filterFunc: (it) =>
      it.printings.filter(printFilters.setFilter(value)).length > 0
  })
