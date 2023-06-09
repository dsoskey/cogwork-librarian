import { FilterNode, Filter, identity } from './base'
import { NormedCard } from '../types/normedCard'
// TODO: reorg with base/oracle/print
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
