import { format } from 'date-fns'
import { Alias } from './types'

export const stdlib = (now: Date): { [key: string]: Alias } => ({
  released: {
    name: "released",
    description: "Cards that have been released as of today",
    query: `date<=${format(now, "yyyy-MM-dd")}`
  },
  newest: {
    name: "newest",
    description: "order cards newest -> oldest",
    query: `order:released direction:desc`
  },
  bar: {
    name: "bar",
    description: "cards that fit the Bar Cube brewer's guidelines (no counters, tokens, back faces, etc.)",
    query: `-fo:token (-fo:/\\bcounters?\\b/ or fo:/counter (it|up to|target|that|all)/) game:paper -has:back -is:dfc -is:extra -fo:/\\bnote\\b/`,
  },
  htr: {
    name: "htr",
    description: "Heroes of the Realm sets",
    query: 'set:PH22,ph21,ph20,ph19,ph18,ph17,phtr'
  },
})