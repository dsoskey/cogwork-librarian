import Dexie, { Table } from 'dexie'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
import { NormedCard } from '../mql/types/normedCard'
import { CubeDefinition } from '../mql/types/cube'
import { IllustrationTag, OracleTag } from '../mql/types/tag'
import { DataSource } from '../../types'
import { RunStrategy } from '../scryfallExtendedParser'

export interface Collection {
  id: string
  name: string
  type: string
  blob: Blob
  lastUpdated: Date
  filter: string
}

export interface QueryHistory {
  id?: string
  rawQueries: string[],
  baseIndex: number
  projectPath: string;
  errorText?: string
  source: DataSource
  strategy?: RunStrategy
  executedAt: Date
}

export interface Block {
  block_code: string
  block: string
  set_codes: string[]
}

// name, count
export interface CardEntry {
  name: string
  quantity: number
  // Set code
  set?: string
  // Collector number
  cn?: string
}

export interface Project {
  path: string;
  savedCards: CardEntry[];
  ignoredCards: string[];
  queries: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectFolder {
  path: string;
}

export const MANIFEST_ID = 'the_one'
export type Manifest = Omit<Collection, 'blob'>

export const isScryfallManifest = (s: string): boolean =>
  ["oracle_cards", "unique_artwork", "default_cards", "all_cards", "rulings"].includes(s)

export const toManifest = (
  bulkDataDefinition: BulkDataDefinition,
  filter: string = ""
): Manifest => ({
  ...bulkDataDefinition,
  id: MANIFEST_ID,
  name: bulkDataDefinition.uri,
  lastUpdated: new Date(),
  filter: filter.trim(),
})

export class TypedDexie extends Dexie {
  LAST_UPDATE = new Date('2023-11-20')

  collection!: Table<Collection>

  card!: Table<NormedCard>

  cube!: Table<CubeDefinition>

  oracleTag!: Table<OracleTag>
  illustrationTag!: Table<IllustrationTag>
  block!: Table<Block>
  history!: Table<QueryHistory>
  project!: Table<Project>
  projectFolder!: Table<ProjectFolder>

  getCube = (key: String) => this.cube.get(key)
  getOtag = (key: String) => this.oracleTag.get({ label: key })
  getAtag = (key: String) => this.illustrationTag.get({ label: key })
  getBlock = (key: string) => this.block
    .get({ block_code: key })
    .then(it => {
      if (it === undefined) {
        return this.block.get({ block: key })
      }
      return it
    })

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

    this.version(9).stores({
      block: "block_code, block"
    })

    this.version(10).stores({
      collection: "id, name, last_updated, filter"
    }).upgrade(trans  => {
      return trans.table("collection").toCollection()
        .modify(c => {
          if (c.filter === undefined) {
            c.filter = ""
          }
        })
    })

    this.version(11).stores({
      history: '++id, executedAt, project',
      project: 'path, createdAt, updatedAt',
      projectFolder: 'path',
    }).upgrade(trans => {
      return trans.table("history").toCollection()
        .modify(h => {
          if (h.projectPath === undefined) {
            h.projectPath = ""
          }
        })
    })
  }
}
export const cogDB = new TypedDexie()
