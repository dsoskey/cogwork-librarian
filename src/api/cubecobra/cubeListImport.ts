import { CogCubeDefinition } from '../local/db'


const URL_BASE = "https://cubecobra.com/cube/api/cubeJSON/"
export async function importCubeCobra(cubeId: string): Promise<Partial<CogCubeDefinition>> {
  const response = await fetch(`${URL_BASE}${cubeId}`)

  const json = await response.json();
  const cards = json.cards.mainboard.map(it => ({
    print_id: it.details.scryfall_id,
    oracle_id: it.details.oracle_id,

  }))
  console.debug(json);
  return {
    name: json.name,
    cover_image: {
      uri: json.image.uri,
      artist: json.image.artist,
    },
    created_by: json.owner.username,
    last_source_update: new Date(json.date),
    description: json.description,
    cards,
  };
}