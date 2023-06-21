import { FilterNode } from './base'
import { oracleNode } from './oracle'
import { setFilter, setTypeFilter } from './set'
import { gameFilter } from './game'
import { languageFilter } from './language'

export const inFilter = (value: string): FilterNode =>
  oracleNode({
    filtersUsed: ["in"],
    filterFunc: (card) =>
      card.printings.filter(
        printing => setFilter(value)({ printing, card }) ||
          setTypeFilter(value)({ printing, card }) ||
          gameFilter(value)({ printing, card }) ||
          languageFilter(value)({ printing, card })
        ).length > 0
  })
