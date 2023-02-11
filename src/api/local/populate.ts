import * as Scry from 'scryfall-sdk'
import { Card } from 'scryfall-sdk'
import { cogDB, CollectionMetadata, Manifest } from './db'
import { normCardList, NormedCard } from './normedCard'
export const downloadCards = async (
  manifest: Manifest
): Promise<NormedCard[]> => {
  const download = await Scry.BulkData.downloadByType(
    manifest.type,
    manifest.updated_at
  )
  const results: Array<Card> = (download as any).map(Scry.Card.construct)

  return normCardList(results)
}
export const putFile = async (
  manifest: CollectionMetadata,
  data: NormedCard[]
) => {
  console.info('putting!')
  try {
    await cogDB.collection.put({
      ...manifest,
      id: 'the_one',
      blob: new Blob([JSON.stringify(data)]),
    })
  } catch (e) {
    console.info(e)
  }
}
