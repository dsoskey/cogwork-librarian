import { FilterNode } from './base'
import { oracleNode } from './oracle'
import { NormedCard } from '../types/normedCard'

export const oracleTagFilter = (label: string): FilterNode => {
  return oracleNode({
    filtersUsed: ['otag'],
    filterFunc: (card: NormedCard) => card.oracle_tags[label]
  })
}