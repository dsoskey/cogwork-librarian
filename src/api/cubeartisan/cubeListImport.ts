import { CoverImage } from "../local/db";
import { parseISO } from 'date-fns'

export interface CubeArtisanImportData {
  oracleIds: string[]
  printIds: string[]
  name: string,
  description: string,
  cover_image: CoverImage
  created_by: string
  last_source_update: Date
}
export async function importCubeArtisan(cubeId: string): Promise<CubeArtisanImportData> {
  const response = await fetch(`https://cubeartisan.net/cube/${cubeId}/export/json`)
  const cube = await response.json();
  const printIds = cube.cards.map(it => it.cardID)
  return { printIds, oracleIds: cube.cardOracles, name: cube.name, description: cube.description,
    cover_image: {
      uri: cube.image_uri,
      artist: cube.image_artist,
    },
    created_by: cube.owner_name,
    last_source_update: parseISO(cube.last_updated),
  }
}