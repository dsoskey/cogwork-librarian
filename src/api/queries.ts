import { isValues } from './card'

export const displayQueries = [
  'o=/whenever ~ deals/',
  'o:/add {.}\\./',
  '-o:~',
  'cmc:1',
  'o:draw',
  'o:"draw a card"',
  'o:"elf" or o:"goblin"',
  '(o:"elf" or o:"goblin") -o:~',
  'o:"create a"',
  'pow=6',
  'tou=9',
  't=creature',
  't:merfolk',
  't="legendary creature"',
  't=/tribal .* elf/',
  'c=g',
  'c:g',
  'c<=w',
  'c>R',
  'c>=U',
  'c=ur',
  'c=urg',
  'c=urgwb',
  'c=witherbloom',
  'c<=savai',
  'c=c',
  'name=/^A-/',
  't:adventure',
  'o:/sacrifice a.*:/ t:artifact',
  'o:/sacrifice a.*:/ t:creature',
  'c=urgw', // reported upstream: https://github.com/dekkerglen/CubeCobra/issues/2337
  'is:modal -t:scheme',
  'is:filterland',
]

const testQueries = [
  ...displayQueries,
  ...Object.values(isValues).map((it) => `is:${it}`),
  'layout:art_series',
  'o=draw',
  'o="draw a card"',
  'o:"elf" OR o:"goblin"',
  'o:"elf" oR o:"goblin"',
  'o:"elf" Or o:"goblin"',
  'o:/{t}: add \{.}\./',
  'o:"CREATURE"',
  'pow>10',
  'pow<10',
  'power=6',
  'tough=9',
  'toughness=9',
  't=merfolk',
  't=CREATURE',
  '-layout:art_series',
  '-type=token',
  'pow=0 name:tarmogoyf',
]

const unimplementedQueries = [
  `fo:"put the rest on the bottom"`, // oracle works like full-oracle atm
  'keyword:flying', // this searches for the keyword itself, excluding references to the keyword in other abilities
]

const brokenQueries = []
