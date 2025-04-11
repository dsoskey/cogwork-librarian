
import {
  Border,
  Card,
  CardFinish,
  CardFrame,
  CardSecurityStamp,
  Color,
  FrameEffect, Game,
  ImageUris, parseProducedMana,
  PromoType,
  Rarity, SetType
} from 'mtgql'

import { MTGJSONSet, AllPrintings } from './types'
import { Layout } from 'mtgql/build/generated/models/Layout'

const sideToIndex = {
  "a": 0,
  "b": 1,
  "c": 2,
  "d": 3,
  "e": 4,
}

export async function downloadMTGJSONDB(): Promise<Card[]> {
  const allPrints = await downloadAllPrintsCompressed()
  return allPrintingsToScryfallCard(allPrints);
}

export async function downloadAllPrintsCompressed(): Promise<AllPrintings> {
  console.time("total time zipped")
  console.time("request zipped")
  const response = await fetch("https://mtgjson.com/api/v5/AllPrintings.json.gz")
  console.timeEnd("request zipped")
  console.log(response);
  // const blob = await response.blob();

  console.time("decompress zipped")
  const ds = new DecompressionStream("gzip");
  const decompressedStream = response.body.pipeThrough(ds);
  const decompressedResponse = new Response(decompressedStream);
  console.timeEnd("decompress zipped")

  console.time("response jsoned zipped")
  const result: AllPrintings = await decompressedResponse.json();
  console.timeEnd("response jsoned zipped")

  console.timeEnd("total time zipped")
  return result;
}


export async function downloadSetCompressed(code: string): Promise<MTGJSONSet> {
  console.time("total time zipped")
  console.time("request zipped")
  const response = await fetch(`https://mtgjson.com/api/v5/${code.toUpperCase()}.json.gz`)
  console.timeEnd("request zipped")
  console.log(response);
  // const blob = await response.blob();

  console.time("decompress zipped")
  const ds = new DecompressionStream("gzip");
  const decompressedStream = response.body.pipeThrough(ds);
  const decompressedResponse = new Response(decompressedStream);
  console.timeEnd("decompress zipped")

  console.time("response jsoned zipped")
  const result: MTGJSONSet = (await decompressedResponse.json()).data;
  console.timeEnd("response jsoned zipped")

  console.timeEnd("total time zipped")
  return result;
}

export function allPrintingsToScryfallCard(allPrints: AllPrintings): Card[] {
  const results: Card[] = []

  for (const key in allPrints.data) {
    results.push(...mtgjsonSetToScryfallCard(allPrints.data[key]));
  }
  return results;
}


export function mtgjsonSetToScryfallCard(set: MTGJSONSet): Card[] {
  const boosterTypes = new Set([
    "expansion",
    "core",
    "masters"
  ])
  const digitalGames = new Set([
    "arena", "dreamcast", "mtgo", "shandalar"
  ])
  const result: Card[] = [];
  const idtoIndex = {};
  const mtgjsonCards = (set.cards ?? [])
  for (let i = 0; i < mtgjsonCards.length; i++){
    const card = mtgjsonCards[i];
    idtoIndex[card.uuid] = i;
  }
  for (let i = 0; i < mtgjsonCards.length; i++) {
    const card = mtgjsonCards[i];
    const toPush: Card = {
      id: card.identifiers.scryfallId,
      oracle_id: card.identifiers.scryfallOracleId,
      all_parts: undefined, //todo
      arena_id: card.identifiers.mtgArenaId ? parseInt(card.identifiers.mtgArenaId) : undefined,
      artist: card.artist ?? "",
      artist_ids: card.artistIds,
      attraction_lights: card.attractionLights,
      booster: boosterTypes.has(set.type),
      border_color: card.borderColor as Border,
      card_back_id: card.identifiers.scryfallCardBackId,
      cardmarket_id: card.identifiers.mcmId ? parseInt(card.identifiers.mcmId) : undefined,
      cmc: card.manaValue,
      collector_number: card.number,
      color_identity: card.colorIdentity as Color[],
      color_indicator: card.colorIndicator as Color[],
      colors: card.colors as Color[],
      content_warning: card.hasContentWarning,
      digital: card.availability.some(it => digitalGames.has(it)),
      edhrec_rank: card.edhrecRank,
      finishes: card.finishes as CardFinish[],
      flavor_name: card.flavorName,
      flavor_text: card.flavorText,
      frame: card.frameVersion as CardFrame,
      frame_effects: card.frameEffects as FrameEffect[],
      full_art: card.isFullArt,
      game_changer: false, // todo
      games: card.availability as Game[],
      hand_modifier: card.hand,
      highres_image: false, // todo
      illustration_id: card.identifiers.scryfallIllustrationId,
      image_status: "highres_scan",
      image_uris: imageUris(card.identifiers.scryfallId, "front"),
      keywords: card.keywords ?? [],
      lang: card.language.toLowerCase(),
      layout: card.layout as Layout,
      legalities: card.legalities as any,
      life_modifier: card.life,
      loyalty: card.loyalty,
      mana_cost: card.manaCost,
      mtgo_foil_id: card.identifiers.mtgoFoilId ? parseInt(card.identifiers.mtgoFoilId) : undefined,
      mtgo_id: card.identifiers.mtgoId ? parseInt(card.identifiers.mtgoId) : undefined,
      multiverse_ids: card.identifiers.multiverseId ? [parseInt(card.identifiers.multiverseId)] : undefined,
      name: card.name,
      object: 'card',
      oracle_text: card.text ?? "",
      oversized: card.isOversized,
      penny_rank: 0,
      power: card.power,
      // preview: undefined,
      prices: {},
      // printed_name: card.pr,
      // printed_text: '',
      // printed_type_line: '',
      prints_search_uri: '',
      promo: false, //todo
      promo_types: card.promoTypes as PromoType[],
      purchase_uris: {},
      rarity: card.rarity as Rarity,
      related_uris: {},
      released_at: set.releaseDate,
      reprint: !!card.isReprint,
      reserved: !!card.isReserved,
      rulings_uri: '',
      scryfall_set_uri: '',
      scryfall_uri: `https://scryfall.com/card/${set.code.toLowerCase()}/${card.number}`,
      security_stamp: card.securityStamp as CardSecurityStamp,
      set: set.code.toLowerCase(),
      set_id: "",
      set_name: set.name,
      set_search_uri: '',
      set_type: set.type as SetType,
      set_uri: '',
      story_spotlight: card.isStorySpotlight,
      tcgplayer_etched_id: card.identifiers.tcgplayerEtchedProductId ? parseInt(card.identifiers.tcgplayerEtchedProductId) : undefined,
      tcgplayer_id: card.identifiers.tcgplayerProductId ? parseInt(card.identifiers.tcgplayerProductId) : undefined,
      textless: card.isTextless,
      toughness: card.toughness,
      type_line: card.type,
      uri: '',
      variation: false, // todo
      variation_of: '', // todo
      watermark: card.watermark,
      original_text: card.originalText,
      original_type: card.originalType,
    }
    if (card.otherFaceIds) {
      if (card.side !== "a") continue;
      const names = card.name.split(" // ")
      const sides = [card, ...card.otherFaceIds.map(id => mtgjsonCards[idtoIndex[id]])];
      toPush.card_faces = sides.map(side => ({
        object: "card_face",
        artist: side.artist ?? "",
        artist_id: side.artistIds ? side.artistIds[sideToIndex[side.side]] : undefined,
        cmc: side.faceManaValue,
        color_indicator: side.colorIndicator as Color[],
        colors: side.colors as Color[],
        defense: side.defense,
        flavor_text: side.flavorText,
        illustration_id: side.identifiers.scryfallIllustrationId,
        image_uris: imageUris(side.identifiers.scryfallId, side.side === "a" ? "front": "back"),
        layout: side.layout as Layout,
        loyalty: side.loyalty,
        mana_cost: side.manaCost,
        name: names[sideToIndex[side.side]],
        oracle_id: side.identifiers.scryfallOracleId,
        oracle_text: side.text ?? "",
        power: side.power,
        // printed_name: side.
        // printed_text: side.printing,
        // printed_type_line: side.printing,
        toughness: side.toughness,
        type_line: side.type,
        watermark: side.watermark,
        original_text: side.originalText,
        original_type: side.originalType,
      }))
      toPush.type_line = sides.map(it => it.type).join(" // ")
    }
    toPush.produced_mana = parseProducedMana(toPush)
    result.push(toPush);
  }

  return result;
}

function imageUris(id: string, side: "front" | "back"): ImageUris {
  return {
    art_crop: `https://cards.scryfall.io/art_crop/${side}/${id[0]}/${id[1]}/${id}.jpg`,
    border_crop: `https://cards.scryfall.io/border_crop/${side}/${id[0]}/${id[1]}/${id}.jpg`,
    large: `https://cards.scryfall.io/large/${side}/${id[0]}/${id[1]}/${id}.jpg`,
    normal: `https://cards.scryfall.io/normal/${side}/${id[0]}/${id[1]}/${id}.jpg`,
    png: `https://cards.scryfall.io/png/${side}/${id[0]}/${id[1]}/${id}.jpg`,
    small: `https://cards.scryfall.io/small/${side}/${id[0]}/${id[1]}/${id}.jpg`,
  }
}