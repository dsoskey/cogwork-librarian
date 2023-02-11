import Dexie, { Table } from 'dexie'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
export interface Collection {
  id: string
  name: string
  type: string
  blob: Blob
  lastUpdated: Date
}
export type Manifest = Omit<Collection, 'blob'>

export const toManifest = (
  bulkDataDefinition: BulkDataDefinition
): Manifest => ({
  ...bulkDataDefinition,
  name: bulkDataDefinition.uri,
  lastUpdated: new Date(bulkDataDefinition.updated_at),
})

export class TypedDexie extends Dexie {
  collection!: Table<Collection>

  constructor() {
    super('cogwork-librarian')

    // DEPRECATED
    this.version(1).stores({
      manifest: 'id, uri, type, updated_at',
      card: 'id, oracle_id, cmc, color_identity, colors, name, oracle_text, power, toughness',
    })

    this.version(2).stores({
      collection: 'id, name, last_updated',
      card: null,
      manifest: null,
    })
  }
}
export const cogDB = new TypedDexie()
