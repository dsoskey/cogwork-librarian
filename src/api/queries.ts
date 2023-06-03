import { isValues } from './memory/types/card'

export const displayQueries = [
  'o=/whenever ~ deals/',
  'o:/add {.}\\./',
  '-o:~',
  'cmc:1',
  'o:"elf" or o:"goblin"',
  '(o:"elf" or o:"goblin") -o:~',
  'o:"create a"',
  't=creature',
  't:merfolk',
  't="legendary creature"',
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
  'c=urgw', // reported upstream: https://github.com/dekkerglen/CubeCobra/issues/2337
  'is:modal -t:scheme',
  'is:filterland',
]

export const testQueries = [
  ...displayQueries,
  ...Object.values(isValues).map((it) => `is:${it}`),
  'layout:art_series',
  'o:/elf/ OR o:/goblin/',
  "o:'elf' oR o:'goblin'",
  'o:"elf" Or o:"goblin"',
  'o:/{t}: add \{.}\./',
  '-layout:art_series',
  '-type=token',
  'keyword:flying',
  'format:pioneer',
  'banned:modern',
  'restricted:vintage',
  'border:white cn:69',
  'not:promo',
  'date<=2015-08-18',
  'usd>5',
  'eur<1',
  'tix>10',
  'f:pioneer pt>=5 mv=1',
  'flavor:banana',
  'year=2020',
  'lang:any',
  'cube:april',
]

const unimplementedQueries = [
  't:plane', // this currently gets planeswalkers too, but scryfall only shows planes
  'is:frenchvanilla',
  'include:extras', // this one seems to be processed separately?
  'in:rare',
  'st:funny',
  'is:planeswalker_deck',
  'is:league',
  'is:etched',
  'is:buyabox',
  'is:giftbox',
  'is:intro_pack',
  'is:gameday',
  'is:prerelease',
  'is:release',
  'is:fnm',
  'is:judge_gift',
  'is:arena_league',
  'is:player_rewards',
  'is:media_insert',
  'is:instore',
  'is:convention',
  'is:set_promo',
  'is:brawler',
  'is:spotlight',
  'new:flavor',
  'new:art',
  'new:artist',
  '-in:mtgo f:legacy',
  'date>ori',
  'language:japanese',
  'in:ru',
  'new:language',
  'name:/^A\\-/',
]

const notGonnaImplementQueries = [
  'art|atag|arttag|function|otag|oracletag'
] // custom regex, display keywords

const brokenQueries = [
  // Both of these aren't handling all of the card faces properly
  "is:dfc c<=w",
  "is:dfc ci<=w",
  "is:token",
]
