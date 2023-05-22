import { Card } from 'scryfall-sdk'
import { cogDB, Manifest } from './db'
import { normCardList, NormedCard } from '../memory/types/normedCard'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
export const downloadCards = async (
  manifest: BulkDataDefinition
): Promise<NormedCard[]> => {
  const download = await fetch(manifest.download_uri, { method: 'GET' })

  const results: Array<Card> = (await download.json()).map(Card.construct)

  return normCardList(results)
}
export const putFile = async (manifest: Manifest, data: NormedCard[]) => {
  const toSave = data.filter(card => {
    if (card.oracle_id === undefined) {
      console.warn(`card with no oracle_id: ${card.name}`)
      console.debug(card)
      return false
    } else if (card.name === undefined) {
      console.warn(`card with no name: ${card.oracle_id}`)
      return false
    } else {
      return true
    }
  })

  await cogDB.transaction("rw", cogDB.collection, cogDB.card, async () => {
    await cogDB.collection.put({
      ...manifest,
      lastUpdated: new Date(),
      id: 'the_one',
      blob: new Blob([]),
    })
    await cogDB.card.clear()
    await cogDB.card.bulkPut(toSave)
  })
}