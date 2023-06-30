import { FilterNode } from './base'
import { NormedCard } from '../types/normedCard'
import { oracleNode } from './oracle'

export const cubeFilter = (cubeKey: string): FilterNode => {
  return oracleNode({
    filtersUsed: ['cube'],
    filterFunc: (card: NormedCard) => card.cube_ids[cubeKey]
  })
}