
export interface CubeArtisanCardIds {
  oracleIds: string[]
  printIds: string[]
}
export async function importCubeArtisan(cubeId: string): Promise<CubeArtisanCardIds> {
  const response = await fetch(`https://cubeartisan.net/cube/${cubeId}/export/json`)
  const cube = await response.json();
  const printIds = cube.cards.map(it => it.cardID)
  return { printIds, oracleIds: cube.cardOracles }
}