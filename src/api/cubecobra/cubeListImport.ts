import { CubeCard } from 'mtgql'


const URL_BASE = "https://cubecobra.com/cube/api/cubeJSON/"
export async function importCubeCobra(cubeId: string): Promise<CubeCard[]> {
  const response = await fetch(`${URL_BASE}${cubeId}`)

  const json = await response.json();
  const cards = json.cards.mainboard.map(it => ({
    print_id: it.details.scryfall_id,
    oracle_id: it.details.oracle_id,

  }))
  console.debug(json);
  return cards;
}