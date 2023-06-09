import { FilterNode } from './base'
import { oracleNode } from './oracle'
import { setFilter, setTypeFilter } from './set'
import { gameFilter } from './game'
import { languageFilter } from './language'

export const inFilter = (value: string): FilterNode =>
  oracleNode({
    filtersUsed: ["in"],
    filterFunc: (it) =>
      it.printings.filter(
        print => setFilter(value)(print) ||
          setTypeFilter(value)(print) ||
          gameFilter(value)(print) ||
          languageFilter(value)(print)
        ).length > 0
  })
