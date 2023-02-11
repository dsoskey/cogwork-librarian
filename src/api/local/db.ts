import Dexie, { Table } from 'dexie'
import { Card } from 'scryfall-sdk'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'

type ManifestKeys = 'id' | 'uri' | 'type' | 'updated_at'
export type Manifest = Pick<BulkDataDefinition, ManifestKeys>

export type CardKeys =
  | 'id'
  | 'oracle_id'
  | 'cmc'
  | 'color_identity'
  | 'colors'
  | 'name'
  | 'oracle_text'
  | 'power'
  | 'toughness'
export type CardTable = Pick<Card, CardKeys>

export interface Collection {
  id: string
  name: string
  type: string
  blob: Blob
  lastUpdated: Date
}
export type CollectionMetadata = Omit<Collection, 'blob'>
export const toMetadata = (manifest: Manifest) => ({
  ...manifest,
  name: manifest.uri,
  lastUpdated: new Date(manifest.updated_at),
})

export class TypedDexie extends Dexie {
  manifest!: Table<Manifest>

  card!: Table<CardTable>

  collection!: Table<Collection>

  constructor() {
    super('cogwork-librarian')

    this.version(1).stores({
      /*
            source: https://scryfall.com/docs/api/bulk-data
            √ id 	UUID 		A unique ID for this bulk item.
            √ uri 	URI 		The Scryfall API URI for this file.
            √ type 	String 		A computer-readable string for the kind of bulk item.
            name 	String 		A human-readable name for this file.
            description 	String 		A human-readable description for this file.
            download_uri 	URI 		The URI that hosts this bulk file for fetching.
            √ updated_at 	Timestamp 		The time when this file was last updated.
            size 	Integer 		The size of this file in integer bytes.
            content_type 	MIME Type 		The MIME type of this file.
            content_encoding 	Encoding 		The Content-Encoding encoding that will be used to transmit this file when you download it.
            */
      manifest: 'id, uri, type, updated_at',

      /*
            ## Core
            arena_id 	Integer 	Nullable 	This card’s Arena ID, if any. A large percentage of cards are not available on Arena and do not have this ID.
            √ id 	UUID 		A unique ID for this card in Scryfall’s database.
            lang 	String 		A language code for this printing.
            mtgo_id 	Integer 	Nullable 	This card’s Magic Online ID (also known as the Catalog ID), if any. A large percentage of cards are not available on Magic Online and do not have this ID.
            mtgo_foil_id 	Integer 	Nullable 	This card’s foil Magic Online ID (also known as the Catalog ID), if any. A large percentage of cards are not available on Magic Online and do not have this ID.
            multiverse_ids 	Array 	Nullable 	This card’s multiverse IDs on Gatherer, if any, as an array of integers. Note that Scryfall includes many promo cards, tokens, and other esoteric objects that do not have these identifiers.
            tcgplayer_id 	Integer 	Nullable 	This card’s ID on TCGplayer’s API, also known as the productId.
            tcgplayer_etched_id 	Integer 	Nullable 	This card’s ID on TCGplayer’s API, for its etched version if that version is a separate product.
            cardmarket_id 	Integer 	Nullable 	This card’s ID on Cardmarket’s API, also known as the idProduct.
            object 	String 		A content type for this object, always card.
            √ oracle_id 	UUID 		A unique ID for this card’s oracle identity. This value is consistent across reprinted card editions, and unique among different cards with the same name (tokens, Unstable variants, etc).
            prints_search_uri 	URI 		A link to where you can begin paginating all re/prints for this card on Scryfall’s API.
            rulings_uri 	URI 		A link to this card’s rulings list on Scryfall’s API.
            scryfall_uri 	URI 		A link to this card’s permapage on Scryfall’s website.
            uri 	URI 		A link to this card object on Scryfall’s API. 
        
            ## Gameplay
            all_parts 	Array 	Nullable 	If this card is closely related to other cards, this property will be an array with Related Card Objects.
            card_faces 	Array 	Nullable 	An array of Card Face objects, if this card is multifaced.
            cmc 	Decimal 		The card’s converted mana cost. Note that some funny cards have fractional mana costs.
            color_identity 	Colors 		This card’s color identity.
            color_indicator 	Colors 	Nullable 	The colors in this card’s color indicator, if any. A null value for this field indicates the card does not have one.
            colors 	Colors 	Nullable 	This card’s colors, if the overall card has colors defined by the rules. Otherwise the colors will be on the card_faces objects, see below.
            edhrec_rank 	Integer 	Nullable 	This card’s overall rank/popularity on EDHREC. Not all cards are ranked.
            hand_modifier 	String 	Nullable 	This card’s hand modifier, if it is Vanguard card. This value will contain a delta, such as -1.
            keywords 	Array 		An array of keywords that this card uses, such as 'Flying' and 'Cumulative upkeep'.
            layout 	String 		A code for this card’s layout.
            legalities 	Object 		An object describing the legality of this card across play formats. Possible legalities are legal, not_legal, restricted, and banned.
            life_modifier 	String 	Nullable 	This card’s life modifier, if it is Vanguard card. This value will contain a delta, such as +2.
            loyalty 	String 	Nullable 	This loyalty if any. Note that some cards have loyalties that are not numeric, such as X.
            mana_cost 	String 	Nullable 	The mana cost for this card. This value will be any empty string "" if the cost is absent. Remember that per the game rules, a missing mana cost and a mana cost of {0} are different values. Multi-faced cards will report this value in card faces.
            name 	String 		The name of this card. If this card has multiple faces, this field will contain both names separated by ␣//␣.
            oracle_text 	String 	Nullable 	The Oracle text for this card, if any.
            oversized 	Boolean 		True if this card is oversized.
            penny_rank 	Integer 	Nullable 	This card’s rank/popularity on Penny Dreadful. Not all cards are ranked.
            power 	String 	Nullable 	This card’s power, if any. Note that some cards have powers that are not numeric, such as *.
            produced_mana 	Colors 	Nullable 	Colors of mana that this card could produce.
            reserved 	Boolean 		True if this card is on the Reserved List.
            toughness 	String 	Nullable 	This card’s toughness, if any. Note that some cards have toughnesses that are not numeric, such as *.
            type_line 	String 		The type line of this card. 
            */
      card: 'id, oracle_id, cmc, color_identity, colors, name, oracle_text, power, toughness',
    })

    this.version(2).stores({
      collection: 'id, name, last_updated',
      card: null,
      manifest: null,
    })
  }
}
export const cogDB = new TypedDexie()
