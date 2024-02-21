import { format } from 'date-fns'

export const stdlib = (now: Date) => ({
  released: { name: "released", query: `date<=${format(now, "yyyy-MM-dd")}` },
  newest: { name: "newest", query: `order:released direction:desc` },
  bar: {
    name: "bar",
    query: `-fo:token (-fo:/\\bcounters?\\b/ or fo:/counter (it|up to|target|that|all)/) game:paper -has:back -is:dfc -is:extra -fo:/\\bnote\\b/`,
  },
  "pauper-commander": {
    name: "pauper-commander",
    query: '(is:commander or t:creature) r:u'
  },
  htr: {
    name: "htr",
    query: 'set:PH22 or set:ph21 or set:ph20 or set:ph19 or set:ph18 or set:ph17 or set:phtr'
  },
})