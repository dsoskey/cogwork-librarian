import { FilterNode } from './base'
import { oracleNode } from './oracle'
import { setFilter } from './set'

export const inFilter = (value: string): FilterNode =>
  oracleNode({
    filtersUsed: ["in"],
    filterFunc: (it) =>
      it.printings.filter(setFilter(value)).length > 0
  })
