import { format } from 'date-fns'
import { Alias } from './types'

export const stdlib = (now: Date): { [key: string]: Alias } => ({
  released: { name: "released", query: `date<=${format(now, "yyyy-MM-dd")}` },
  newest: { name: "newest", query: `order:released direction:desc` },
  oldest: { name: "oldest", query: `order:released direction:desc` },
  standard: { name: "wasIsOrWillBeInStandard", query: `(st:core or st:expansion)` },
  bar: {
    name: "bar",
    query: `-fo:token (-fo:/\\bcounters?\\b/ or fo:/counter (it|up to|target|that|all)/) game:paper -has:back -is:dfc -is:extra -fo:/\\bnote\\b/`,
  },
  "pauper-commander": {
    name: "pauper-commander",
    query: '(is:commander or t:creature) r:u'
  },
  traditional: {
    name: "default-skin",
    hovertext: 'Attempts to filter out digital cards, joke cards, and unreadable showcase printings.',
    query: 'in:paper -is:silly -is:showcase -frame:showcase -border:silver -border:gold -border:borderless -is:full -l:phyrexian',
  htr: {
    name: "htr",
    query: 'set:PH22 or set:ph21 or set:ph20 or set:ph19 or set:ph18 or set:ph17 or set:phtr'
  },
})
