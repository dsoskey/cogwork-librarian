import * as Scry from 'scryfall-sdk'
import { Card } from 'scryfall-sdk'
import { BulkDataType } from 'scryfall-sdk/out/api/BulkData'
import { cogDB, Manifest } from './db'

export const putManifest = async (type: BulkDataType): Promise<Manifest> => {
  const result = await Scry.BulkData.definitionByType(type)
  await cogDB.manifest.put(result)
  return result
}

export const putCards = async (manifest: Manifest): Promise<Card[]> => {
  const download = await Scry.BulkData.downloadByType(
    manifest.type,
    manifest.updated_at
  )
  const results: Array<Card> = (download as any).map(Scry.Card.construct)
  await cogDB.card.bulkPut(results)
  return results
}
