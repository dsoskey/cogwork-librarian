import { ObjectValues } from '../../types'

export const keywords = {
  a: 'a',
  artist: 'artist',
  banned: 'banned',
  border: 'border',
  c: 'c',
  cn: 'cn',
  ci: 'ci',
  commander: 'commander',
  cmc: 'cmc',
  color: 'color',
  date: 'date',
  e: 'e',
  edition: 'edition',
  eur: 'eur',
  f: 'f',
  fo: 'fo',
  format: 'format',
  frame: 'frame',
  flavor: 'flavor', ft: 'ft',
  game: 'game',
  id: 'id',
  identity: 'identity',
  is: 'is',
  in: 'in',
  keyword: 'keyword',
  lang: 'lang', language: 'language',
  layout: 'layout',
  loy: 'loy',
  loyalty: 'loyalty',
  m: 'm',
  mana: 'mana',
  manavalue: 'manavalue',
  mv: 'mv',
  name: 'name',
  not: 'not',
  number: 'number',
  o: 'o', oracle: 'oracle',
  pow: 'pow', power: 'power',
  powtou: 'powtou', pt: 'pt',
  r: 'r',
  rarity: 'rarity',
  restricted: 'restricted',
  s: 's',
  set: 'set',
  st: 'st',
  stamp: 'stamp',
  t: 't',
  text: 'text',
  tix: 'tix',
  tou: 'tou',
  toughness: 'toughness',
  type: 'type',
  usd: 'usd',
  watermark: 'watermark', wm: 'wm',
  year: 'year',
} as const

export const keywordsToImplement = {
  '!': '!',
  // Requires tagging data
  art: 'art', arttag: 'arttag', atag: 'atag',
  function: 'function', oracletag: 'oracletag', otag: 'otag',
  // Requires set data
  b: 'b', block: 'block',
  // Could be cool for loading a custom cube list
  cube: 'cube',
  devotion: 'devotion',
  // Requires sort parser??
  direction: 'direction',
  new: 'new',
  order: 'order',
  has: 'has', // has:indicator has:watermark
  include: 'include', // include:extras
  prefer: 'prefer',
  produces: 'produces',
  unique: 'unique',
} as const

const all = {
  ...keywords,
  ...keywordsToImplement,
} as const

type Keyword = ObjectValues<typeof all>
export const syntaxDocs: Record<Keyword, string> = {
  '!': 'https://scryfall.com/docs/syntax#exact',
  a: 'https://scryfall.com/docs/syntax#flavor',
  art: 'https://scryfall.com/docs/syntax#tagger',
  artist: 'https://scryfall.com/docs/syntax#flavor',
  arttag: 'https://scryfall.com/docs/syntax#tagger',
  atag: 'https://scryfall.com/docs/syntax#tagger',
  b: 'https://scryfall.com/docs/syntax#sets',
  banned: 'https://scryfall.com/docs/syntax#legality',
  block: 'https://scryfall.com/docs/syntax#sets',
  border: 'https://scryfall.com/docs/syntax#frame',
  c: 'https://scryfall.com/docs/syntax#colors',
  ci: 'https://scryfall.com/docs/syntax#colors',
  cmc: 'https://scryfall.com/docs/syntax#mana',
  cn: 'https://scryfall.com/docs/syntax#sets',
  color: 'https://scryfall.com/docs/syntax#colors',
  commander: 'https://scryfall.com/docs/syntax#colors',
  cube: 'https://scryfall.com/docs/syntax#cubes',
  date: 'https://scryfall.com/docs/syntax#year',
  devotion: 'https://scryfall.com/docs/syntax#mana',
  direction: 'https://scryfall.com/docs/syntax#display',
  e: 'https://scryfall.com/docs/syntax#sets',
  edition: 'https://scryfall.com/docs/syntax#sets',
  eur: 'https://scryfall.com/docs/syntax#prices',
  f: 'https://scryfall.com/docs/syntax#legality',
  flavor: 'https://scryfall.com/docs/syntax#flavor',
  fo: 'https://scryfall.com/docs/syntax#oracle',
  format: 'https://scryfall.com/docs/syntax#legality',
  frame: 'https://scryfall.com/docs/syntax#frame',
  ft: 'https://scryfall.com/docs/syntax#flavor',
  function: 'https://scryfall.com/docs/syntax#tagger',
  game: 'https://scryfall.com/docs/syntax#promos',
  has: 'https://scryfall.com/docs/syntax#',
  id: 'https://scryfall.com/docs/syntax#colors',
  identity: 'https://scryfall.com/docs/syntax#colors',
  in: 'https://scryfall.com/docs/syntax#sets',
  include: 'https://scryfall.com/docs/syntax#extras',
  is: 'https://scryfall.com/docs/syntax#shortcuts',
  keyword: 'https://scryfall.com/docs/syntax#oracle',
  lang: 'https://scryfall.com/docs/syntax#languages',
  language: 'https://scryfall.com/docs/syntax#languages',
  layout: 'https://scryfall.com/docs/syntax#',
  loy: 'https://scryfall.com/docs/syntax#stats',
  loyalty: 'https://scryfall.com/docs/syntax#stats',
  m: 'https://scryfall.com/docs/syntax#mana',
  mana: 'https://scryfall.com/docs/syntax#mana',
  manavalue: 'https://scryfall.com/docs/syntax#mana',
  mv: 'https://scryfall.com/docs/syntax#mana',
  name: 'https://scryfall.com/docs/syntax#regex',
  new: 'https://scryfall.com/docs/syntax#rarity',
  not: 'https://scryfall.com/docs/syntax#negating',
  number: 'https://scryfall.com/docs/syntax#sets',
  o: 'https://scryfall.com/docs/syntax#oracle',
  oracle: 'https://scryfall.com/docs/syntax#oracle',
  oracletag: 'https://scryfall.com/docs/syntax#tagger',
  order: 'https://scryfall.com/docs/syntax#display',
  otag: 'https://scryfall.com/docs/syntax#tagger',
  pow: 'https://scryfall.com/docs/syntax#stats',
  power: 'https://scryfall.com/docs/syntax#stats',
  powtou: 'https://scryfall.com/docs/syntax#stats',
  prefer: 'https://scryfall.com/docs/syntax#display',
  produces: 'https://scryfall.com/docs/syntax#mana',
  pt: 'https://scryfall.com/docs/syntax#stats',
  r: 'https://scryfall.com/docs/syntax#rarity',
  rarity: 'https://scryfall.com/docs/syntax#rarity',
  restricted: 'https://scryfall.com/docs/syntax#legality',
  s: 'https://scryfall.com/docs/syntax#sets',
  set: 'https://scryfall.com/docs/syntax#sets',
  st: 'https://scryfall.com/docs/syntax#sets',
  stamp: 'https://scryfall.com/docs/syntax#frame',
  t: 'https://scryfall.com/docs/syntax#types',
  text: 'https://scryfall.com/docs/syntax#oracle',
  tix: 'https://scryfall.com/docs/syntax#prices',
  tou: 'https://scryfall.com/docs/syntax#stats',
  toughness: 'https://scryfall.com/docs/syntax#stats',
  type: 'https://scryfall.com/docs/syntax#types',
  unique: 'https://scryfall.com/docs/syntax#display',
  usd: 'https://scryfall.com/docs/syntax#prices',
  watermark: 'https://scryfall.com/docs/syntax#flavor',
  wm: 'https://scryfall.com/docs/syntax#flavor',
  year: 'https://scryfall.com/docs/syntax#year',
}
