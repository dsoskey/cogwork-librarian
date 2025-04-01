export type AllPrintings = {
  meta: any
  data: { [setCode: string]: MTGJSONSet }
}

export type MTGJSONSet = {
  baseSetSize: number;
  block?: string;
  booster?: Record<string, BoosterConfig>;
  cards: CardSet[];
  cardsphereSetId?: number;
  code: string;
  codeV3?: string;
  decks?: DeckSet[];
  isForeignOnly?: boolean;
  isFoilOnly: boolean;
  isNonFoilOnly?: boolean;
  isOnlineOnly: boolean;
  isPaperOnly?: boolean;
  isPartialPreview?: boolean;
  keyruneCode: string;
  languages?: string[];
  mcmId?: number;
  mcmIdExtras?: number;
  mcmName?: string;
  mtgoCode?: string;
  name: string;
  parentCode?: string;
  releaseDate: string;
  sealedProduct?: any[]; //SealedProduct[];
  tcgplayerGroupId?: number;
  tokens: CardToken[];
  tokenSetCode?: string;
  totalSetSize: number;
  translations: Translations;
  type: string;
};

export type BoosterConfig = {
  boosters: BoosterPack[];
  boostersTotalWeight: number;
  name?: string;
  sheets: Record<string, BoosterSheet>;
};

export type BoosterSheet = {
  allowDuplicates?: boolean;
  balanceColors?: boolean;
  cards: Record<string, number>;
  foil: boolean;
  fixed?: boolean;
  totalWeight: number;
};

export type DeckSet = {
  code: string;
  commander?: CardSetDeck[];
  mainBoard: CardSetDeck[];
  name: string;
  releaseDate: string | null;
  sealedProductUuids: string[] | null;
  sideBoard: CardSetDeck[];
  type: string;
};

export type CardSetDeck = {
  count: number;
  isFoil?: boolean;
  uuid: string;
};

export type BoosterPack = {
  contents: Partial<Record<string, number>>;
  weight: number;
};




export type CardSet = {
  artist?: string;
  artistIds?: string[];
  asciiName?: string;
  attractionLights?: number[];
  availability: string[];
  boosterTypes?: string[];
  borderColor: string;
  cardParts?: string[];
  colorIdentity: string[];
  colorIndicator?: string[];
  colors: string[];
  convertedManaCost: number;
  defense?: string;
  duelDeck?: string;
  edhrecRank?: number;
  edhrecSaltiness?: number;
  faceConvertedManaCost?: number;
  faceFlavorName?: string;
  faceManaValue?: number;
  faceName?: string;
  finishes: string[];
  flavorName?: string;
  flavorText?: string;
  foreignData?: ForeignData[];
  frameEffects?: string[];
  frameVersion: string;
  hand?: string;
  hasAlternativeDeckLimit?: boolean;
  hasContentWarning?: boolean;
  hasFoil: boolean;
  hasNonFoil: boolean;
  identifiers: Identifiers;
  isAlternative?: boolean;
  isFullArt?: boolean;
  isFunny?: boolean;
  isOnlineOnly?: boolean;
  isOversized?: boolean;
  isPromo?: boolean;
  isRebalanced?: boolean;
  isReprint?: boolean;
  isReserved?: boolean;
  isStarter?: boolean;
  isStorySpotlight?: boolean;
  isTextless?: boolean;
  isTimeshifted?: boolean;
  keywords?: string[];
  language: string;
  layout: string;
  leadershipSkills?: LeadershipSkills;
  legalities: Legalities;
  life?: string;
  loyalty?: string;
  manaCost?: string;
  manaValue: number;
  name: string;
  number: string;
  originalPrintings?: string[];
  originalReleaseDate?: string;
  originalText?: string;
  originalType?: string;
  otherFaceIds?: string[];
  power?: string;
  printings?: string[];
  promoTypes?: string[];
  purchaseUrls: PurchaseUrls;
  rarity: string;
  relatedCards?: RelatedCards;
  rebalancedPrintings?: string[];
  rulings?: Rulings[];
  securityStamp?: string;
  setCode: string;
  side?: string;
  signature?: string;
  sourceProducts?: SourceProducts;
  subsets?: string[];
  subtypes: string[];
  supertypes: string[];
  text?: string;
  toughness?: string;
  type: string;
  types: string[];
  uuid: string;
  variations?: string[];
  watermark?: string;
};

export type ForeignData = {
  faceName?: string;
  flavorText?: string;
  identifiers: Identifiers;
  language: string;
  name: string;
  text?: string;
  type?: string;
};

export type Identifiers = {
  abuId?: string;
  cardKingdomEtchedId?: string;
  cardKingdomFoilId?: string;
  cardKingdomId?: string;
  cardsphereId?: string;
  cardsphereFoilId?: string;
  cardtraderId?: string;
  csiId?: string;
  mcmId?: string;
  mcmMetaId?: string;
  miniaturemarketId?: string;
  mtgArenaId?: string;
  mtgjsonFoilVersionId?: string;
  mtgjsonNonFoilVersionId?: string;
  mtgjsonV4Id?: string;
  mtgoFoilId?: string;
  mtgoId?: string;
  multiverseId?: string;
  scgId?: string;
  scryfallId?: string;
  scryfallCardBackId?: string;
  scryfallOracleId?: string;
  scryfallIllustrationId?: string;
  tcgplayerProductId?: string;
  tcgplayerEtchedProductId?: string;
  tntId?: string;
};

export type LeadershipSkills = {
  brawl: boolean;
  commander: boolean;
  oathbreaker: boolean;
};

export type Legalities = {
  alchemy?: string;
  brawl?: string;
  commander?: string;
  duel?: string;
  explorer?: string;
  future?: string;
  gladiator?: string;
  historic?: string;
  historicbrawl?: string;
  legacy?: string;
  modern?: string;
  oathbreaker?: string;
  oldschool?: string;
  pauper?: string;
  paupercommander?: string;
  penny?: string;
  pioneer?: string;
  predh?: string;
  premodern?: string;
  standard?: string;
  standardbrawl?: string;
  timeless?: string;
  vintage?: string;
};

export type CardToken = {
  artist?: string;
  artistIds?: string[];
  asciiName?: string;
  availability: string[];
  boosterTypes?: string[];
  borderColor: string;
  cardParts?: string[];
  colorIdentity: string[];
  colorIndicator?: string[];
  colors: string[];
  edhrecSaltiness?: number;
  faceName?: string;
  faceFlavorName?: string;
  finishes: string[];
  flavorName?: string;
  flavorText?: string;
  frameEffects?: string[];
  frameVersion: string;
  hasFoil: boolean;
  hasNonFoil: boolean;
  identifiers: Identifiers;
  isFullArt?: boolean;
  isFunny?: boolean;
  isOnlineOnly?: boolean;
  isOversized?: boolean;
  isPromo?: boolean;
  isReprint?: boolean;
  isTextless?: boolean;
  keywords?: string[];
  language: string;
  layout: string;
  loyalty?: string;
  manaCost?: string;
  name: string;
  number: string;
  orientation?: string;
  originalText?: string;
  originalType?: string;
  otherFaceIds?: string[];
  power?: string;
  promoTypes?: string[];
  relatedCards?: RelatedCards;
  reverseRelated?: string[];
  securityStamp?: string;
  setCode: string;
  side?: string;
  signature?: string;
  sourceProducts?: string[];
  subsets?: string[];
  subtypes: string[];
  supertypes: string[];
  text?: string;
  toughness?: string;
  type: string;
  types: string[];
  uuid: string;
  watermark?: string;
};

export type RelatedCards = {
  reverseRelated?: string[];
  spellbook?: string[];
};

export type PurchaseUrls = {
  cardKingdom?: string;
  cardKingdomEtched?: string;
  cardKingdomFoil?: string;
  cardmarket?: string;
  tcgplayer?: string;
  tcgplayerEtched?: string;
};

export type Translations = {
  "Ancient Greek"?: string;
  Arabic?: string;
  "Chinese Simplified"?: string;
  "Chinese Traditional"?: string;
  French?: string;
  German?: string;
  Hebrew?: string;
  Italian?: string;
  Japanese?: string;
  Korean?: string;
  Latin?: string;
  Phyrexian?: string;
  "Portuguese (Brazil)"?: string;
  Russian?: string;
  Sanskrit?: string;
  Spanish?: string;
};

export type Rulings = {
  date: string;
  text: string;
};

export type SourceProducts = {
  etched: string[];
  foil: string[];
  nonfoil: string[];
};