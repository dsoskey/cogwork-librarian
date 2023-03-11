import { Card } from 'scryfall-sdk'
import { ObjectValues } from '../../types'
import _groupBy from 'lodash/groupBy'
import _pick from 'lodash/pick'
import _omit from 'lodash/omit'
import { Filter } from '../memory/filterBase'
import { CardFace } from 'scryfall-sdk/out/api/Cards'

const PRINT_KEYS = {
  arena_id: 'arena_id',
  artist: 'artist',
  booster: 'booster',
  border_color: 'border_color',
  card_faces: 'card_faces',
  cardmarket_id: 'cardmarket_id',
  collector_number: 'collector_number',
  digital: 'digital',
  finishes: 'finishes',
  flavor_text: 'flavor_text',
  frame: 'frame',
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
  rarity: 'rarity',
  related_uris: 'related_uris',

  released_at: 'released_at',
  reprint: 'reprint',
  rulings_uri: 'rulings_uri',
  // "artist_ids"|
  scryfall_set_uri: 'scryfall_set_uri',
  scryfall_uri: 'scryfall_uri',
  security_stamp: 'security_stamp',
  set: 'set',
  set_id: 'set_id',
  set_name: 'set_name',
  set_search_uri: 'set_search_uri',
  set_type: 'set_type',
  set_uri: 'set_uri',
  tcgplayer_id: 'tcgplayer_id',
  uri: 'uri',
  watermark: 'watermark',
  oversized: 'oversized',
  variation: 'variation',
  full_art: 'full_art',
  textless: 'textless',
  story_spotlight: 'story_spotlight',
} as const
type PrintKeys = ObjectValues<typeof PRINT_KEYS>

export type Printing = Pick<Card, PrintKeys>

export type OracleKeys = keyof Omit<Card, PrintKeys>
export interface NormedCard extends Omit<Card, PrintKeys> {
  printings: Printing[]
  card_faces: CardFace[]
}

export const normCardList = (cardList: Card[]): NormedCard[] => {
  const cardsByOracle = _groupBy(cardList, 'oracle_id')

  return Object.values(cardsByOracle).map((cards) => ({
    ...(_omit(cards[0], Object.keys(PRINT_KEYS)) as Omit<Card, PrintKeys>),
    printings: cards.map(
      (it) => _pick(it, Object.keys(PRINT_KEYS)) as Printing
    ),
    card_faces: cards[0].card_faces,
  }))
}

export const findPrinting =
  (filterFunc: Filter<Printing>) =>
    ({ printings, ...rest }: NormedCard): Card | undefined => {
      const maybePrint = printings.find(filterFunc)
      if (maybePrint !== undefined) {
        return Card.construct(<Card>{
            ...rest,
            ...maybePrint,
          }
        )
      }
      return undefined
    }

export const allPrintings =
  (filterFunc: Filter<Printing>) =>
  ({ printings, ...rest }: NormedCard): Card[] => {
    return printings.filter(filterFunc).map((it) =>
      Card.construct(<Card>{
        ...rest,
        ...it,
      })
    )
  }
