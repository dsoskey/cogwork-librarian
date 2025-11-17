import { CubeCard, Cube } from 'mtgql'


const URL_BASE = "https://cubecobra.com/cube/api/cubeJSON/"
export async function importCubeCobra(cubeId: string, now: Date): Promise<Cube> {
  const response = await fetch(`${URL_BASE}${cubeId}`)

  const json = await response.json();
  console.debug('fetched cube', cubeId, json);
  const cards = json.cards.mainboard.map(it => {
    const result: Partial<CubeCard> = {
      print_id: it.details.scryfall_id,
      oracle_id: it.details.oracle_id,
      alt_image_back_uri: it.imgBackUrl,
      alt_image_uri: it.imgUrl,
      tags: it.tags,
      status: it.status,
      notes: it.notes,
    }
    // conditionally add these fields,
    // they can override db card data for cube-specific analysis
    if (it.custom_name) result.name = it.custom_name
    if (it.rarity) result.rarity = it.rarity;
    if (it.cmc) result.cmc = it.cmc;
    if (it.type_line) result.type_line = it.type_line;
    if (it.colors) result.colors = it.colors;
    if (it.colorCategory) {
      result.color_category = it.colorCategory;
    } else {
      result.color_category = it.details.colorcategory;
    }
    return result
  })

  return {
    key: cubeId,
    canonical_id: json.id,
    oracle_ids: cards.map(it => it.oracle_id),
    print_ids: cards.map(it => it.print_id),
    source: "cubecobra",
    name: json.name,
    cover_image: {
      uri: json.image.uri,
      artist: json.image.artist,
      card_name: json.image.imageName,
    },
    created_by: json.owner.username,
    last_source_update: new Date(json.date),
    description: json.description,
    last_updated: now,
    cards,
  };
}