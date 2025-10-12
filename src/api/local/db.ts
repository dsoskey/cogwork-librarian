import Dexie, { Table } from 'dexie'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
import {
  Block,
  CachingFilterProvider,
  CardSet,
  Cube,
  DataProvider,
  IllustrationTag,
  NormedCard,
  OracleTag
} from 'mtgql'
import { DataSource } from '../../types'
import { Project } from './types/project'
import { RunStrategy } from '../queryRunnerCommon'
import { ThemeDefinition } from './types/theme'
import { CardToIllustrationTag, CardToOracleTag } from './types/tags'
import { importCubeCobra } from '../cubecobra/cubeListImport'

export interface Collection {
  id: string // used for NormedCard.collectionId
  name: string
  type: string
  bulkUrl?: string
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
): Manifest => {
  return ({
    ...bulkDataDefinition,
    id: MANIFEST_ID,
    lastUpdated: new Date(),
    filter: filter.trim(),
    bulkUrl: bulkDataDefinition.download_uri
  })
}

export class TypedDexie extends Dexie implements DataProvider {
  LAST_UPDATE = new Date('2023-11-20')

  collection!: Table<Collection>

  card!: Table<NormedCard>
  customCard!: Table<NormedCard>
  cube!: Table<Cube>
  oracleTag!: Table<OracleTag>
  cardToOtag!: Table<CardToOracleTag>
  illustrationTag!: Table<IllustrationTag>
  cardToItag!: Table<CardToIllustrationTag>
  block!: Table<Block>
  set!: Table<CardSet>
  history!: Table<QueryHistory>
  project!: Table<Project>
  projectFolder!: Table<ProjectFolder>
  theme: Table<ThemeDefinition>

  getCube = async (key: string, canRefresh: boolean = true) => {
    const existingCube = await this.cube.get(key);
    const now = new Date();

    if (
      !canRefresh ||
      localStorage.getItem("auto-find-cube.coglib.sosk.watch") === "false"
    ) {
      return existingCube;
    }

    if (existingCube !== undefined) {
      const autoRefresh = localStorage.getItem('auto-refresh-cube.coglib.sosk.watch') === 'true';
      const timeSinceRefreshMillis = now.getTime() - existingCube.last_source_update.getTime();
      const refreshRate = getRefreshRateInMilliseconds();
      if (autoRefresh && timeSinceRefreshMillis > refreshRate) {
        // should refresh. pass through to try statement
      } else {
        return existingCube;
      }
    }

    try {
      const newCube = await importCubeCobra(key, now);
      await this.cube.put(newCube);

      return newCube;
    } catch (error) {
      console.error('failed to fetch cube, using existing cube if present', error);
      return existingCube;
    }
  }
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

  getSet = (key: string) => this.set.get({ code: key })

  getCardByNameId = async (name: string, id?: string) => {
    let res = await cogDB.card.where("name").equals(name).toArray();
    if (res.length === 0)
      res = await cogDB.card.where("name").startsWith(`${name} /`).toArray();
    if (res.length === 0)
      res = await cogDB.card.where("name").equalsIgnoreCase(name).toArray();
    if (res.length === 0)
      res = await cogDB.card.where("name").startsWithIgnoreCase(`${name} /`).toArray();
    if (res.length === 0) return undefined;
    const card = res.length > 1 && id
      ? res.find(card => card.printings.find(it => it.id === id)) ?? res[0]
      : res[0];

    const printing = card.printings.find(it => it.id === id) ?? card.printings[0]
    return { ...card, ...printing }
  }

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

    this.version(12).stores({
      card: 'oracle_id, name, collectionId',
    })

    this.version(13).stores({
      theme: 'name, createdAt, updatedAt'
    })

    this.version(14).stores({
      customCard: 'oracle_id, name, collectionId',
    })

    this.version(15).stores({
      cube: 'key, name',
    }).upgrade(trans => {
      return trans.table("cube").toCollection()
        .modify(c => {
          if (c.name === undefined) {
            c.name = c.key
          }
          if (c.description === undefined) {
            c.description = ""
          }
          if (c.created_by === undefined) {
            c.created_by = ""
          }
        })
    })

    this.version(16).stores({
      set: 'id, code, name'
    })

    this.version(17).stores({
      cardToOtag: 'oracle_id',
      cardToItag: 'id',
    })

    this.version(18).stores({
      project: 'path, createdAt, updatedAt',
    }).upgrade(trans => {
      return trans.table("project").toCollection()
        .modify(c => {
          c.savedCards = [{ "*": c.savedCards }]
        })
    })

    this.version(19).stores({
      project: 'path, createdAt, updatedAt',
    })

    this.version(20).stores({
      history: '++id, executedAt, project, projectPath',
    }).upgrade(trans => {
      return trans.table("history").toCollection().modify(function(value) {
        if (value.rawQueries.length === 0) {
          delete this.value;
        }
      })
    })
  }
}
export const cogDB = new TypedDexie()
export const COGDB_FILTER_PROVIDER = new CachingFilterProvider(cogDB)

export function getRefreshRateInMilliseconds() {
  let refreshRate = parseInt(localStorage.getItem('refresh-rate.coglib.sosk.watch')??'0');
  if (isNaN(refreshRate)) {
    refreshRate = 0;
  }
  const refreshUnits = JSON.parse(localStorage.getItem('refresh-units.coglib.sosk.watch')??'"minutes"');

  switch (refreshUnits) {
    case 'minutes':
      return refreshRate * 1000 * 60;
    case 'hours':
      return refreshRate * 1000 * 60 * 60;
    case 'days':
      return refreshRate * 1000 * 60 * 60 * 24;
    case 'seconds':
    default:
      return refreshRate * 1000;
  }
}