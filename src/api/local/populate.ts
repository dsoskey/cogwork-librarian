import { Card } from 'scryfall-sdk'
import { cogDB, Manifest } from './db'
import { normCardList, NormedCard } from './normedCard'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
export const downloadCards = async (
  manifest: BulkDataDefinition
): Promise<NormedCard[]> => {
  const download = await fetch(manifest.download_uri, { method: 'GET' })

  const results: Array<Card> = (await download.json()).map(Card.construct)

  return normCardList(results)
}

export const putFile = async (manifest: Manifest, data: NormedCard[]) => {
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
