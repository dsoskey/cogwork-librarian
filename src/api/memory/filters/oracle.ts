import { FilterNode, Filter, identity } from './base'
import { NormedCard } from '../types/normedCard'

export interface OracleFilter {
  filtersUsed: string[]
  filterFunc: Filter<NormedCard>
  inverseFunc?: Filter<NormedCard>
}
export const oracleNode =
  ({ filtersUsed, filterFunc, inverseFunc }: OracleFilter): FilterNode => ({
    filtersUsed,
    filterFunc,
    inverseFunc,
    printFilter: identity(),
    printInverse: identity(),
  })
