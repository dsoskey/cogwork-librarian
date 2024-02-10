import { Card } from 'scryfall-sdk'
import { ObjectValues } from './common'
import _groupBy from 'lodash/groupBy'
import _pick from 'lodash/pick'
import _omit from 'lodash/omit'
import _sortBy from 'lodash/sortBy'
import { CardFace } from 'scryfall-sdk'

export const DEFAULT_CARD_BACK_ID = "0aeebaf5-8c7d-4636-9e82-8c27447861f7"

const PRINT_KEYS = {
  attraction_lights: "attraction_lights",
  arena_id: 'arena_id',
  artist: 'artist',
  booster: 'booster',
  border_color: 'border_color',
  card_faces: 'card_faces',
  cardmarket_id: 'cardmarket_id',
  card_back_id: 'card_back_id',
  collector_number: 'collector_number',
  digital: 'digital',
  finishes: 'finishes',
  flavor_name: 'flavor_name',
  flavor_text: 'flavor_text',
  frame: 'frame',
  frame_effects: "frame_effects",
  games: 'games',
  highres_image: 'highres_image',
  id: 'id',
  // "nonfoil"|
  illustration_id: 'illustration_id',
  image_status: 'image_status',
  image_uris: 'image_uris',
  lang: 'lang',
  mtgo_foil_id: 'mtgo_foil_id',
  mtgo_id: 'mtgo_id',
  multiverse_ids: 'multiverse_ids',
  preview: 'preview',
  prices: 'prices',
  promo: 'promo',
  promo_types: 'promo_types',
  printed_name: "printed_name",
  rarity: 'rarity',
  // related_uris: 'related_uris',

  released_at: 'released_at',
  reprint: 'reprint',
  // rulings_uri: 'rulings_uri',
  // "artist_ids"|
  // scryfall_set_uri: 'scryfall_set_uri',
  scryfall_uri: 'scryfall_uri',
  security_stamp: 'security_stamp',
  set: 'set',
  set_id: 'set_id',
  set_name: 'set_name',
  // set_search_uri: 'set_search_uri',
  set_type: 'set_type',
  // set_uri: 'set_uri',
  tcgplayer_id: 'tcgplayer_id',
  tcgplayer_etched_id: 'tcgplayer_etched_id',
  // uri: 'uri',
  watermark: 'watermark',
  oversized: 'oversized',
  variation: 'variation',
  full_art: 'full_art',
  textless: 'textless',
  story_spotlight: 'story_spotlight',
} as const
type PrintKeys = ObjectValues<typeof PRINT_KEYS>

export type Printing = Pick<Card, PrintKeys>

export interface PrintingFilterTuple {
  printing: Printing
  card: NormedCard
}

export type OracleKeys = keyof Omit<Card, PrintKeys>

const IGNORE_KEYS = {
  prints_search_uri: "prints_search_uri",
  related_uris: "related_uris",
  rulings_uri: "rulings_uri",
  scryfall_set_uri: "scryfall_set_uri",
  set_search_uri: "set_search_uri",
  set_uri: "set_uri",
  uri: "uri",
}
export type IgnoreKeys = ObjectValues<typeof IGNORE_KEYS>

export interface NormedCard extends Omit<Card, PrintKeys> {
  printings: Printing[]
  // there are oracle and print fields on card faces, so the normed card holds a reference to one for oracle filters
  card_faces: CardFace[]
}

const ignorePaths = [...Object.keys(PRINT_KEYS), ...Object.keys(IGNORE_KEYS)]
const printPaths = Object.keys(PRINT_KEYS)

export const normCardList = (cardList: Card[]): NormedCard[] => {
  // grouping by oracle_id flattens cards with multiple different rules text prints like Balloon Stand
  // This makes things like prints behave unexpectedly, since scryfall counts the one printing but coglib counts 4
  const cardsByOracle = _groupBy(cardList, 'oracle_id')
  const result: NormedCard[] = []

  for (const oracleId in cardsByOracle) {
    // sorting by released at is needed for new and prefer filters
    const cards = _sortBy(cardsByOracle[oracleId], it => new Date(it.released_at), "set")
    const normed = {
      ...(_omit(cards[0], ignorePaths)) as Omit<Card, PrintKeys>,
      printings: cards.map((it) => _pick(it, printPaths) as Printing),
      card_faces: cards[0].card_faces,
    }
    result.push(normed)
  }
  return result
}