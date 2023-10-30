import Dexie, { Table } from 'dexie'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
import { NormedCard } from '../memory/types/normedCard'
import { CubeDefinition } from '../memory/types/cube'
import { IllustrationTag, OracleTag } from '../memory/types/tag'
import { DataSource } from '../../types'

export interface Collection {
  id: string
  name: string
  type: string
  blob: Blob
  lastUpdated: Date
}

export interface QueryHistory {
  id?: string
  rawQueries: string[],
  baseIndex: number
  errorText?: string
  source: DataSource
  executedAt: Date
}

export const MANIFEST_ID = 'the_one'
export type Manifest = Omit<Collection, 'blob'>

export const isScryfallManifest = (s: string): boolean =>
  ["oracle_cards", "unique_artwork", "default_cards", "all_cards", "rulings"].includes(s)

export const toManifest = (
  bulkDataDefinition: BulkDataDefinition
): Manifest => ({
  ...bulkDataDefinition,
  id: MANIFEST_ID,
  name: bulkDataDefinition.uri,
  lastUpdated: new Date(),
})

export class TypedDexie extends Dexie {
  LAST_UPDATE = new Date('2023-06-24')

  collection!: Table<Collection>

  card!: Table<NormedCard>

  cube!: Table<CubeDefinition>

  oracleTag!: Table<OracleTag>
  illustrationTag!: Table<IllustrationTag>
  history!: Table<QueryHistory>

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

    this.version(5).stores({
      collection: 'id, name, last_updated',
      card: 'oracle_id, name',
      cube: 'key',
    }).upgrade (trans => {
      return trans.table("card").toCollection().modify (card => {
        if (card.cube_ids === undefined) {
          card.cube_ids = {}
        } else if (card.cube_ids instanceof Set) {
          const cube_ids = {}
          for (const id of Array.from(card.cube_ids)) {
            cube_ids[id as string] = true
          }
        }
      })
    })

    this.version(6).stores({
      collection: 'id, name, last_updated',
      card: 'oracle_id, name',
      cube: 'key',
      oracleTag: 'id, label'
    }).upgrade(trans => {
      return trans.table("card").toCollection().modify (card => {
        if (card.oracle_tags === undefined) {
          card.oracle_tags = {}
        }
      })
    })

    this.version(7).stores({
      history: '++id, executedAt',
    })

    this.version(8).stores({
      illustrationTag: 'id, label'
    })
  }

  addCube = async (cube: CubeDefinition) => {
    const existingCube: CubeDefinition = await this.cube.get(cube.key)
      ?? { key: cube.key, oracle_ids: [], source: "list", last_updated: new Date() }
    const cardSet = new Set(cube.oracle_ids)
    const toRemove = existingCube.oracle_ids.filter(it => !cardSet.has(it))
    await this.transaction("rw", this.cube, this.card, async () => {
      await this.cube.put(cube)
      await this.card.where("oracle_id").anyOf(cube.oracle_ids)
        .modify(it => {
          if (it.cube_ids === undefined) {
            it.cube_ids = {}
          }
          it.cube_ids[cube.key] = true
        })
      if (toRemove.length > 0) {
        await this.card.where("oracle_id").anyOf(toRemove)
          .modify(it => delete it.cube_ids[cube.key])
      }
    })
  }

  bulkUpsertCube = async (cubes: CubeDefinition[]) => {
    const cubeIds = cubes.map(it => it.key)
    const existingCubes = await this.cube.bulkGet(cubeIds)
    const oracleIdToCubesToAdd: { [oracleId: string]: string[] } = {}
    const oracleIdToCubesToRemove: { [oracleId: string]: string[] } = {}
    const oracleIdsToCheck = new Set<string>()

    cubes.forEach((cube, index) => {
      const existingCube = existingCubes[index] ?? { key: cube.key, oracle_ids: [] }
      const cardSet = new Set(cube.oracle_ids)

      cardSet.forEach(it => {
        if (oracleIdToCubesToAdd[it] === undefined) {
          oracleIdToCubesToAdd[it] = []
        }
        oracleIdToCubesToAdd[it].push(cube.key)
        oracleIdsToCheck.add(it)
      })

      existingCube.oracle_ids.filter(it => !cardSet.has(it)).forEach(it => {
        if (oracleIdToCubesToRemove[it] === undefined) {
          oracleIdToCubesToRemove[it] = []
        }
        oracleIdToCubesToRemove[it].push(cube.key)
        oracleIdsToCheck.add(it)
      })
    })

    await this.transaction("rw", this.cube, this.card, async () => {
      await this.cube.bulkPut(cubes)
      await this.card.where("oracle_id").anyOf(Array.from(oracleIdsToCheck))
        .modify(it => {
          if (it.cube_ids === undefined) {
            it.cube_ids = {}
          }
          const cubesToAdd = oracleIdToCubesToAdd[it.oracle_id] ?? []
          cubesToAdd.forEach(cube => {
           it.cube_ids[cube] = true
          })

          const cubesToRemove = oracleIdToCubesToRemove[it.oracle_id] ?? []
          cubesToRemove.forEach(cube => {
            delete it.cube_ids[cube]
          })
        })
    })
  }

  bulkDeleteCube = async (cubeIds: string[]) => {
    await this.transaction("rw", this.cube, this.card, async () => {
      await this.cube.bulkDelete(cubeIds);
      await this.card.toCollection().modify(card => {
        for (const id of cubeIds) {
          delete card.cube_ids[id];
        }
      })
    })
  }
}
export const cogDB = new TypedDexie()
