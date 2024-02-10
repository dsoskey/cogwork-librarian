import { FilterNode } from './base'
import { NormedCard } from '../types/normedCard'
import { oracleNode } from './oracle'

export function oddEvenFilter(isEven: boolean): FilterNode {
  const equality = isEven ? 0 : 1;
  return oracleNode({
    filtersUsed: ["cmc"],
    filterFunc: (card: NormedCard) => {
      return card.cmc % 2 === equality
    }
  })
}