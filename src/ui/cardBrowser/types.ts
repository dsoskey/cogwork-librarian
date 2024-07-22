import { ObjectValues } from '../../types'
import { EnrichedCard } from '../../api/queryRunnerCommon'

export const displayTypes = {
  cards: 'cards',
  render: 'render',
  list: 'list',
  json: 'json',
  viz: 'viz'
} as const
export type DisplayType = ObjectValues<typeof displayTypes>

export const activeCollections = {
  search: 'search',
  ignore: 'ignore',
} as const
export type ActiveCollection = ObjectValues<typeof activeCollections>

export type VennSection = "left"|"right"|"both"
interface ExtraInfo {
  leftCount: number
  rightCount: number
  bothCount: number
}
export type CardDisplayInfo = Record<ActiveCollection, EnrichedCard[]> & ExtraInfo