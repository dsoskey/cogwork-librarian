import { importCubeCobra } from './cubeListImport'
import {
  CubeDefinition, ExternalCubeSource,
  CubeCard
} from 'mtgql'
import { cogDB as cogDBClient, cogDB } from '../local/db'
import { importCubeArtisan } from '../cubeartisan/cubeListImport'

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
  }
}

async function searchCubeCobra(cubeIds: string[]) {
  const last_updated = new Date()
  const missingCubes: string[] = []
  const cubeDefinitions: CubeDefinition[] = [];
  const results = await Promise.allSettled(cubeIds.map(importCubeCobra))

  for (let i = 0; i < results.length; i++) {
    const cubeId = cubeIds[i]
    const result = results[i]

    if (result.status === "fulfilled") {
      const cards = result.value;
      cubeDefinitions.push({
        key: cubeId,
        cards,
        oracle_ids: cards.map(it => it.oracle_id),
        print_ids: cards.map(it => it.print_id),
        source: "cubecobra",
        last_updated,
      })
    } else {
      missingCubes.push(cubeId)
    }
  }

  if (missingCubes.length) {
    postMessage({ type: "error-missing-cubes", data: missingCubes })
    return
  }

  postMessage({ type: "generate-cube-definitions" })

  postMessage({ type: "save-to-db" })

  await cogDB.cube.bulkPut(cubeDefinitions)

  postMessage({ type: "end" })
}

async function searchCubeArtisan(cubeIds: string[]) {
  const foundCubes: { [cubeId: string]: string[] } = {}
  const foundOracleIds = new Set<string>()
  const results = await Promise.allSettled(cubeIds.map(importCubeArtisan))
  const missingCubes: string[] = []

  for (let i = 0; i < results.length; i++) {
    const cubeId = cubeIds[i]
    const result = results[i]

    if (result.status === "fulfilled") {
      foundCubes[cubeId] = result.value.printIds
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

  const newOracles = (await cogDBClient.card.bulkGet(Array.from(foundOracleIds))) ?? [];
  const printToOracleId: { [key: string]: string } = {}
  for (const oracle of newOracles) {
    for (const print of oracle.printings) {
      printToOracleId[print.id] = oracle.oracle_id
    }
  }

  const last_updated = new Date()
  const cubeDefinitions: CubeDefinition[] = Object.entries(foundCubes)
    .map(([key, printIds]) => {
      const cards: CubeCard[] = printIds.map(it => ({ oracle_id: printToOracleId[it], print_id: it }))
      return {
        key,
        cards,
        oracle_ids: cards.map(it => it.oracle_id),
        print_ids: printIds,
        source: "cubeartisan",
        last_updated,
      }
    })

  postMessage({ type: "generate-cube-definitions" })

  postMessage({ type: "save-to-db" })

  await cogDB.cube.bulkPut(cubeDefinitions)

  postMessage({ type: "end" })
}