import { ObjectValues } from '../../types'

export const displayTypes = {
  cards: 'cards',
  list: 'list',
  json: 'json',
} as const
export type DisplayType = ObjectValues<typeof displayTypes>

export const activeCollections = {
  search: 'search',
  ignore: 'ignore',
} as const
export type ActiveCollection = ObjectValues<typeof activeCollections>