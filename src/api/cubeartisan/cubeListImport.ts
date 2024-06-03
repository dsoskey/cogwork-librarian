import { parseISO } from 'date-fns'
import { CubeCard, CoverImage } from 'mtgql'

interface CubeArtisanCard extends Omit<CubeCard, "oracle_id"> {
  print_id: string
}
export interface CubeArtisanImportData {
  oracleIds: string[]
  artisanCards: CubeArtisanCard[]
  name: string,
  canonical_id: string
  description: string,
  cover_image: CoverImage
  created_by: string
  last_source_update: Date
}
export async function importCubeArtisan(cubeId: string): Promise<CubeArtisanImportData> {
  const response = await fetch(`https://cubeartisan.net/cube/${cubeId}/export/json`)
  const cube = await response.json();
  const printIds: CubeArtisanCard[] = cube.cards.map(it => {
    const result: Partial<CubeArtisanCard> = {
      print_id: it.cardID,
      alt_image_back_uri: undefined,
      alt_image_uri: undefined,
      tags: it.tags,
      status: it.status,
      notes: it.notes,
    }
    if (it.name) result.name = it.name;
    if (it.cmc) result.cmc = it.cmc;
    if (it.type_line) result.type_line = it.type_line;
    if (it.rarity) result.rarity = it.rarity;
    if (it.colors) result.colors = it.colors;
    if (it.colorCategory) result.color_category = it.colorCategory;
    return result;
  })

  return { artisanCards: printIds, oracleIds: cube.cardOracles, name: cube.name, description: cube.description,
    canonical_id: cube._id,
    cover_image: {
      uri: cube.image_uri,
      artist: cube.image_artist,
      card_name: cube.image_name,
    },
    created_by: cube.owner_name,
    last_source_update: parseISO(cube.last_updated),
  }
}