import { importCubeCobra } from './cubeListImport'
import {
  ExternalCubeSource,
  CubeCard,
  Cube,
} from 'mtgql'
import { cogDB as cogDBClient, cogDB } from '../local/db'
import { CubeArtisanImportData, importCubeArtisan } from '../cubeartisan/cubeListImport'
import * as Scryfall from 'scryfall-sdk'

self.onmessage = (_event) => {
  const event = _event.data
  if (event.type === "import") {
    searchCubes(event.data).catch(e => postMessage({ type: 'error', data: e.toString() }))
  }
}

interface SearchInput {
  cubeIds: string[]
  source: ExternalCubeSource
}

async function searchCubes({ cubeIds, source }: SearchInput) {
  switch (source) {
    case 'cubeartisan':
      await searchCubeArtisan(cubeIds)
      break;
    case 'cubecobra':
      await searchCubeCobra(cubeIds)
      break;
    default:
      throw Error(`Unknown cube source ${source}`)
  }
}

async function searchCubeCobra(cubeIds: string[]) {
  const last_updated = new Date()
  const missingCubes: string[] = []
  const results = await Promise
    .allSettled(cubeIds.map(it => importCubeCobra(it, last_updated)))

  for (let i = 0; i < results.length; i++) {
    const cubeId = cubeIds[i]
    const result = results[i]
    if (result.status === "rejected") {
      missingCubes.push(cubeId)
    }
  }

  if (missingCubes.length) {
    postMessage({ type: "error-missing-cubes", data: missingCubes })
    return
  }

  postMessage({ type: "generate-cube-definitions" })

  postMessage({ type: "save-to-db" })

  await cogDB.cube.bulkPut(results.filter(it => it.status === "fulfilled").map(it => it.value))

  postMessage({ type: "end" })
}

async function searchCubeArtisan(cubeIds: string[]) {
  const foundCubes: { [cubeId: string]: CubeArtisanImportData } = {}
  const foundOracleIds = new Set<string>()
  const results = await Promise.allSettled(cubeIds.map(importCubeArtisan))
  const missingCubes: string[] = []

  for (let i = 0; i < results.length; i++) {
    const cubeId = cubeIds[i]
    const result = results[i]

    if (result.status === "fulfilled") {
      foundCubes[cubeId] = result.value
      for (const line of result.value.oracleIds) {
        foundOracleIds.add(line)
      }
    } else {
      missingCubes.push(cubeId)
    }
  }

  if (missingCubes.length) {
    postMessage({ type: "error-missing-cubes", data: missingCubes })
    return
  }

  const printToOracleId = await generatePrintToOracleId(foundCubes, foundOracleIds)

  const last_updated = new Date()
  const cubeDefinitions: Cube[] = Object.entries(foundCubes)
    .map(([key, cubeInfo]) => {
      const cards: CubeCard[] = cubeInfo.artisanCards.map(it => ({ oracle_id: printToOracleId[it.print_id], ...it }))
      return {
        key,
        ...cubeInfo,
        cards,
        oracle_ids: cards.map(it => it.oracle_id),
        print_ids: cards.map(it => it.print_id),
        source: "cubeartisan",
        last_updated,
      }
    })

  postMessage({ type: "generate-cube-definitions" })

  postMessage({ type: "save-to-db" })

  await cogDB.cube.bulkPut(cubeDefinitions)

  postMessage({ type: "end" })
}

async function generatePrintToOracleId(
  foundCubes: { [cubeId: string]: CubeArtisanImportData },
  foundOracleIds: Set<string>
): Promise<{ [key: string]: string }> {
  const result: { [key: string]: string } = {}
  const oracleIdsToSearch = Array.from(foundOracleIds)
  const newOracles = (await cogDBClient.card.bulkGet(oracleIdsToSearch)) ?? [];
  const missingDBIndexes = newOracles
    .map((card, index) => card === undefined ? index : -1)
    .filter(index => index !== -1)

  if (missingDBIndexes.length === 0) {
    for (const oracle of newOracles) {
      for (const print of oracle?.printings) {
        result[print.id] = oracle.oracle_id
      }
    }
    return result
  }

  const toCheckScryfall = Array.from(
    new Set(Object.values(foundCubes).flatMap(it => it.artisanCards.map(jt => jt.print_id)))
  ).map((id => Scryfall.CardIdentifier.byId(id)));
  const scryfallCards = await Scryfall.Cards.collection(...toCheckScryfall).waitForAll();

  // todo: test
  if (scryfallCards.not_found.length) {
    throw Error(`Scryfall DB Missing ${scryfallCards.not_found.length} cards`)
  }

  for (const card of scryfallCards) {
    result[card.id] = card.oracle_id
  }
  return result;
}