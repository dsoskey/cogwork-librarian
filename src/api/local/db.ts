import Dexie, { Table } from 'dexie'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
import { NormedCard } from '../memory/types/normedCard'
import { CubeDefinition } from '../memory/types/cube'
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
  LAST_UPDATE = new Date('2023-06-24')

  collection!: Table<Collection>

  card!: Table<NormedCard>

  cube!: Table<CubeDefinition>

  constructor() {
    super('cogwork-librarian')

    this.version(1).stores({
      manifest: 'id, uri, type, updated_at',
      card: 'id, oracle_id, cmc, color_identity, colors, name, oracle_text, power, toughness',
    })

    this.version(2).stores({
      collection: 'id, name, last_updated',
      card: null,
      manifest: null,
    })

    this.version(3).stores({
      collection: 'id, name, last_updated',
      card: 'oracle_id, name',
    })

    this.version(4).stores({
      collection: 'id, name, last_updated',
      card: 'oracle_id, name',
      cube: 'key',
    }).upgrade (trans => {
      return trans.table("card").toCollection().modify (card => {
        if (card.cube_ids === undefined) {
          card.cube_ids = new Set()
        }
      })
    })
  }

  addCube = async (cube: CubeDefinition) => {
    await this.transaction("rw", this.cube, this.card, async () => {
      await this.cube.put(cube)
      await this.card.where("oracle_id").anyOf(cube.oracle_ids)
        .modify(it => {
          if (it.cube_ids === undefined) {
            it.cube_ids = new Set()
          }
          it.cube_ids.add(cube.key)
        })
    })
  }


}
export const cogDB = new TypedDexie()
