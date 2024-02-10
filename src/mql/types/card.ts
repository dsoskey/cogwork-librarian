import { Card } from 'scryfall-sdk'
import { ObjectValues } from './common'
import { NormedCard, OracleKeys } from './normedCard'

export const DOUBLE_FACED_LAYOUTS = [
  'transform',
  'modal_dfc',
  'meld',
  'double_sided',
  'double_faced_token',
  'art_series'
]

export const BASIC_LAND_TYPES = [
  'plains',
  'island',
  'swamp',
  'mountain',
  'forest',
]

export const SHOCKLAND_REGEX =
  /As .* enters the battlefield, you may pay 2 life. If you don't, it enters the battlefield tapped\./

export const IS_VALUE_MAP = {
  gold: 'gold',
  hybrid: 'hybrid',
  phyrexian: 'phyrexian',
  promo: 'promo',
  reprint: 'reprint',
  firstprint: 'firstprint',
  firstprinting: 'firstprinting',
  digital: 'digital',
  dfc: 'dfc',
  mdfc: 'mdfc',
  tdfc: 'tdfc',
  meld: 'meld',
  transform: 'transform',
  split: 'split',
  flip: 'flip',
  leveler: 'leveler',
  commander: 'commander',
  spell: 'spell',
  permanent: 'permanent',
  historic: 'historic',
  vanilla: 'vanilla',
  modal: 'modal',
  fullart: 'fullart',
  foil: 'foil',
  nonfoil: 'nonfoil',
  etched: 'etched',
  token: 'token',
  bikeland: 'bikeland',
  cycleland: 'cycleland',
  bicycleland: 'bicycleland',
  bounceland: 'bounceland',
  karoo: 'karoo',
  canopyland: 'canopyland',
  canland: 'canland',
  fetchland: 'fetchland',
  checkland: 'checkland',
  dual: 'dual',
  fastland: 'fastland',
  filterland: 'filterland',
  gainland: 'gainland',
  painland: 'painland',
  scryland: 'scryland',
  shadowland: 'shadowland',
  snarl: 'snarl',
  slowland: 'slowland',
  shockland: 'shockland',
  storageland: 'storageland',
  creatureland: 'creatureland',
  manland: 'manland',
  triland: 'triland',
  triome: 'triome',
  trikeland: 'trikeland',
  tricycleland: 'tricycleland',
  tangoland: 'tangoland',
  battleland: 'battleland',
  bondland: 'bondland',
  ub: 'ub', universesbeyond: 'universesbeyond',
  unique: 'unique',
  extra: 'extra',
  adventure: "adventure",
  arenaid: "arenaid",
  artseries: "artseries",
  artist: "artist",
  artistmisprint: "artistmisprint",
  belzenlok: "belzenlok",
  lights: "lights",
  augmentation: "augmentation",
  back: "back",
  bear: "bear",
  booster: "booster",
  brawlcommander: "brawlcommander",
  buyabox: "buyabox",
  cardmarket: "cardmarket",
  class: "class",
  ci: "ci",
  colorshifted: "colorshifted",
  companion: "companion",
  contentwarning: "contentwarning",
  core: 'core',
  covered: "covered",
  doublesided: "doublesided",
  duelcommander: "duelcommander",
  etb: "etb",
  englishart: "englishart",
  etch: "etch",
  extended: "extended",
  expansion: 'expansion',
  flavorname: "flavorname",
  flavor: "flavor",
  fbb: "fbb",
  fwb: "fwb",
  frenchvanilla: "frenchvanilla",
  funny: "funny",
  future: "future",
  halo: "halo",
  hires: "hires",
  splitmana: "splitmana",
  illustration: "illustration",
  invitational: "invitational",
  localizedname: "localizedname",
  mtgoid: "mtgoid",
  masterpiece: "masterpiece",
  modern: "modern",
  multiverse: "multiverse",
  new: "new",
  oathbreaker: "oathbreaker",
  old: "old",
  oversized: "oversized",
  paperart: "paperart",
  party: "party",
  phyrexia: "phyrexia",
  planar: "planar",
  placeholderimage: 'placeholderimage',
  printedtext: "printedtext",
  related: "related",
  reserved: "reserved",
  reversible: "reversible",
  stamp: "stamp",
  showcase: "showcase",
  spellbook: "spellbook",
  spikey: "spikey",
  stamped: "stamped",
  story: "story",
  tcgplayer: "tcgplayer",
  textless: "textless",
  tombstone: "tombstone",
  onlyprint: "onlyprint",
  variation: "variation",
  watermark: "watermark",
  serialized: "serialized",
  setextension: "setextension",
  // included in  promo_types
  scroll: "scroll",
  poster: "poster",
  boosterfun: "boosterfun",
  brawldeck: "brawldeck",
  rebalanced: "rebalanced",
  duels: "duels",
  embossed: "embossed",
  moonlitland: "moonlitland",
  openhouse: "openhouse",
  boxtopper: "boxtopper",
  promopack: "promopack",
  gilded: "gilded",
  playpromo: "playpromo",
  setpromo: "setpromo",
  fnm: "fnm",
  mediainsert: "mediainsert",
  wizardsplaynetwork: "wizardsplaynetwork",
  bundle: "bundle",
  concept: "concept",
  halofoil: "halofoil",
  godzillaseries: "godzillaseries",
  neonink: "neonink",
  instore: "instore",
  arenaleague: "arenaleague",
  starterdeck: "starterdeck",
  confettifoil: "confettifoil",
  textured: "textured",
  convention: "convention",
  themepack: "themepack",
  commanderparty: "commanderparty",
  bringafriend: "bringafriend",
  plastic: "plastic",
  alchemy: "alchemy",
  gameday: "gameday",
  intropack: "intropack",
  draculaseries: "draculaseries",
  silverfoil: "silverfoil",
  datestamped: "datestamped",
  league: "league",
  doublerainbow: "doublerainbow",
  release: "release",
  draftweekend: "draftweekend",
  event: "event",
  surgefoil: "surgefoil",
  schinesealtart: "schinesealtart",
  playerrewards: "playerrewards",
  storechampionship: "storechampionship",
  giftbox: "giftbox",
  galaxyfoil: "galaxyfoil",
  glossy: "glossy",
  stepandcompleat: "stepandcompleat",
  oilslick: "oilslick",
  tourney: "tourney",
  premiereshop: "premiereshop",
  judgegift: "judgegift",
  thick: "thick",
  jpwalker: "jpwalker",
  prerelease: "prerelease",
  planeswalkerdeck: "planeswalkerdeck",
} as const
export type IsValue = ObjectValues<typeof IS_VALUE_MAP>

const MANA_SYMBOLS = {
  generic: 'generic',
  w: 'w',
  u: 'u',
  b: 'b',
  r: 'r',
  g: 'g',
  c: 'c',
  s: 's',
  x: 'x',
  y: 'y',

  'w/u': 'w/u',
  'w/b': 'w/b',
  'w/r': 'w/r',
  'w/g': 'w/g',

  'u/w': 'u/w',
  'u/b': 'u/b',
  'u/r': 'u/r',
  'u/g': 'u/g',

  'b/w': 'b/w',
  'b/u': 'b/u',
  'b/r': 'b/r',
  'b/g': 'b/g',

  'r/w': 'r/w',
  'r/u': 'r/u',
  'r/b': 'r/b',
  'r/g': 'r/g',

  'g/w': 'g/w',
  'g/u': 'g/u',
  'g/r': 'g/r',
  'g/b': 'g/b',

  'w/p': 'w/p',
  'u/p': 'u/p',
  'b/p': 'b/p',
  'r/p': 'r/p',
  'g/p': 'g/p',
  'p/w': 'p/w',
  'p/u': 'p/u',
  'p/b': 'p/b',
  'p/r': 'p/r',
  'p/g': 'p/g',

  'w/2': 'w/2',
  'u/2': 'u/2',
  'b/2': 'b/2',
  'r/2': 'r/2',
  'g/2': 'g/2',
  '2/w': '2/w',
  '2/u': '2/u',
  '2/b': '2/b',
  '2/r': '2/r',
  '2/g': '2/g',
} as const
export type ManaSymbol = ObjectValues<typeof MANA_SYMBOLS>

// manaSymbol -> total count of that type of mana
export type ManaCost = Partial<Record<ManaSymbol, number>>

export const manaAliases: Record<ManaSymbol, ManaSymbol> = {
  '2/b': '2/b',
  '2/g': '2/g',
  '2/r': '2/r',
  '2/u': '2/u',
  '2/w': '2/w',
  'b/2': '2/b',
  'b/p': 'b/p',
  'g/2': '2/g',
  'g/p': 'g/p',
  'p/b': 'b/p',
  'p/g': 'g/p',
  'p/r': 'r/p',
  'p/u': 'u/p',
  'p/w': 'w/p',
  'r/2': '2/r',
  'r/p': 'r/p',
  'u/2': '2/u',
  'u/p': 'u/p',
  'w/2': '2/w',
  'w/p': 'w/p',
  'b/g': 'b/g',
  'b/r': 'b/r',
  'b/u': 'u/b',
  'b/w': 'w/b',
  'g/b': 'b/g',
  'g/r': 'r/g',
  'g/u': 'u/g',
  'g/w': 'w/g',
  'r/b': 'b/r',
  'r/g': 'r/g',
  'r/u': 'u/r',
  'r/w': 'w/r',
  'u/b': 'u/b',
  'u/g': 'u/g',
  'u/r': 'u/r',
  'u/w': 'w/u',
  'w/b': 'w/b',
  'w/g': 'w/g',
  'w/r': 'w/r',
  'w/u': 'w/u',
  x: 'x',
  y: 'y',
  // @ts-ignore
  z: 'z',
  generic: 'generic',
  w: 'w',
  u: 'u',
  b: 'b',
  r: 'r',
  g: 'g',
  c: 'c',
  s: 's',
}

export const parsePowTou = (value: any) =>
  value !== undefined
    ? Number.parseInt(value.toString().replace('*', '0'), 10)
    : 0

export const replaceNamePlaceholder = (text: string, name: string): string => {
  return text.replace(/~/g, name).toLowerCase()
}

export const toManaCost = (splitCost: string[]): ManaCost => {
  const result: ManaCost = {}
  for (const rawSymbol of splitCost) {
    // hybrids are considered NaN
    const asNum = rawSymbol.includes('/') ? NaN : Number.parseInt(rawSymbol, 10)
    if (Number.isNaN(asNum)) {
      if (result[manaAliases[rawSymbol]] === undefined) {
        result[manaAliases[rawSymbol]] = 0
      }
      result[manaAliases[rawSymbol]] += 1
    } else {
      if (result.generic === undefined) {
        result.generic = 0
      }
      result.generic += asNum
    }
  }
  return result
}

export const toSplitCost = (cost: string): string[] =>
  cost.toLowerCase()
    .slice(1, cost.length - 1)
    .split('}{')
    .sort()

export const isDual = (card: Card | NormedCard) =>
  card.type_line.includes('Land') && /Add \{.} or \{.}\./.test(card.oracle_text)
export const hasNumLandTypes = (card: Card | NormedCard, num: number) =>
  BASIC_LAND_TYPES.filter((type) => card.type_line.toLowerCase().includes(type))
    .length === num

export const anyFaceContains = (
  card: Card | NormedCard,
  field: OracleKeys,
  value: string,
  fieldTransform: (string) => string = (it) => it
): boolean =>
  fieldTransform(card[field]?.toString().toLowerCase() ?? '').includes(value) ||
  card.card_faces.filter((face) =>
    fieldTransform(face[field]?.toString().toLowerCase() ?? '').includes(value)
  ).length > 0

export const anyFaceRegexMatch = (
  card: Card | NormedCard,
  field: OracleKeys,
  regex: RegExp,
  fieldTransform: (string) => string = (it) => it
): boolean =>
  (card[field] !== undefined
    ? regex.test(fieldTransform(card[field].toString().toLowerCase()))
    : false) ||
  card.card_faces.filter((face) =>
    face[field] !== undefined
      ? regex.test(fieldTransform(face[field].toString().toLowerCase()))
      : false
  ).length > 0

export const noReminderText = (text: string): string =>
  text.replace(/\(.*\)/gi, '')
