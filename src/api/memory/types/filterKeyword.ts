import { ObjectValues } from '../../../types'

export const keywords = {
  '!': '!',
  a: 'a',
  artist: 'artist',
  banned: 'banned',
  border: 'border',
  c: 'c',
  cn: 'cn',
  ci: 'ci',
  commander: 'commander',
  cmc: 'cmc',
  cube: 'cube',
  color: 'color',
  date: 'date',
  devotion: 'devotion', // !Devotion can only match single color or hybrid mana. No two-brid either
  direction: 'direction',
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
  has: 'has', // alias for is
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
  produces: 'produces',
  order: 'order',
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
  unique: 'unique',
  watermark: 'watermark', wm: 'wm',
  year: 'year',
  // Requires tagging data
  function: 'function', oracletag: 'oracletag', otag: 'otag',

} as const

export const keywordsToImplement = {
  // https://discord.com/channels/291498816459243521/361685936179904513/1104796430830411777
  new: 'new', // rarity, flavor, art, artist, frame, language, game, paper, mtgo, arena, nonfoil, foil
  // its not: etched, masterpiece, promo, border, stamp
  prefer: 'prefer',
  // Requires tagging data
  art: 'art', arttag: 'arttag', atag: 'atag',
  // Requires set data
  b: 'b', block: 'block',
  // these affect scryfall's UI behavior. are they needed here?
  include: 'include', // maybe this one overrides a similar scryfall default?
  // display: 'display', is display needed?
} as const

const all = {
  ...keywords,
  ...keywordsToImplement,
} as const

export type FilterKeyword = ObjectValues<typeof all>
