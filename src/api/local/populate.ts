import * as Scry from 'scryfall-sdk'
import { Card } from 'scryfall-sdk'
import { BulkDataType } from 'scryfall-sdk/out/api/BulkData'
import { cogDB, Manifest } from './db'

export const putManifest = async (type: BulkDataType) => {
    const result = await Scry.BulkData.definitionByType(type)
    await cogDB.manifest.put(result)
    return result
}

export const putCards = async (manifest: Manifest) => {
    const download = await Scry.BulkData
        .downloadByType(manifest.type, manifest.updated_at)
    const results: Array<Card> = (download as any).map(Scry.Card.construct)
    await cogDB.card.bulkPut(results)
}

export const populateDB = async (maybeManifest: Manifest | null) => {
    let manifest = maybeManifest
    if (manifest === null) {
        manifest = await putManifest('oracle_cards')
        await putCards(manifest)
    }    
}