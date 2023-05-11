import { NormedCard } from '../types/normedCard'
import { FilterNode } from './base'
import { oracleNode } from './oracle'

export const keywordMatch = (value: string): FilterNode => oracleNode({
  filtersUsed: ['keyword'],
  filterFunc:  (card: NormedCard) =>
    card.keywords.map((it) => it.toLowerCase()).includes(value.toLowerCase())
})