import { NormedCard } from '../types/normedCard'
import { FilterNode } from './base'

export const keywordMatch = (value: string): FilterNode<NormedCard> => ({
  filtersUsed: ['keyword'],
  filterFunc:  (card: NormedCard) =>
    card.keywords.map((it) => it.toLowerCase()).includes(value.toLowerCase())
})