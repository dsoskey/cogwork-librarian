import { importCube } from './cubeListImport'
import { CubeDefinition } from '../memory/types/cube'
import { cogDB } from '../local/db'
import { isOracleVal } from '../memory/filters/is'
import { not } from '../memory/filters/base'


self.onmessage = (_event) => {
  const event = _event.data

  if (event.type === "import") {
    searchCubes(event.data).catch(e => postMessage({ type: 'error', data: e.toString() }))
  }
}

async function searchCubes(cubeIds: string[]) {
  const foundCubes: { [cubeId: string]: string[] } = {}
  const foundNames = new Set<string>()
  const missingCubes: string[] = []

  console.time("download cubes")

  const results = await Promise.allSettled(cubeIds.map(importCube))
  for (let i = 0; i < results.length; i++) {
    const cubeId = cubeIds[i]
    const result = results[i]

    if (result.status === "fulfilled") {
      foundCubes[cubeId] = result.value
      for (const line of result.value) {
        foundNames.add(line)
      }
    } else {
      missingCubes.push(cubeId)
    }
  }

  console.timeEnd("download cubes")

  if (missingCubes.length) {
    postMessage({ type: "error-missing-cubes", data: missingCubes })
    return
  }

  console.time("generate nameToOracleId")
  const nameToOracleId = await lookupCards(foundCubes, foundNames)
  console.timeEnd("generate nameToOracleId")

  postMessage({ type: "generate-cube-definitions" })

  const last_updated = new Date()
  console.log(foundCubes)
  console.log(nameToOracleId)
  const cubeDefinitions: CubeDefinition[] = Object.entries(foundCubes)
    .map(([key, names]) => ({
      key,
      oracle_ids: names.map(it => nameToOracleId[it]).filter(it => it !== undefined),
      source: "cubecobra",
      last_updated,
    }))

  postMessage({ type: "save-to-db" })

  console.log(cubeDefinitions)
  await cogDB.bulkUpsertCube(cubeDefinitions)

  postMessage({ type: "refresh-memory" })
}

async function lookupCards(
  foundCubes: { [cubeId: string]: string[]},
  foundNames: Set<string>,
): Promise<{ [name: string]: string}> {
  postMessage({ type: "card-lookup" })

  const nameToOracleId: { [name: string]: string } = {}
  const foundCards: Set<string> = new Set()

  const filter = not(isOracleVal("extra"))
  await cogDB.card.each(card => {
    const name = foundNames.has(card.name) ? card.name :
      (foundNames.has(card.name.split(" // ")[0]) ? card.name.split(" // ")[0] : undefined)
    if (filter(card) && name !== undefined) {
      nameToOracleId[name] = card.oracle_id
      foundCards.add(name)
    }
  })

  const missingCards = Array.from(foundNames).filter(it => !foundCards.has(it))

  if (missingCards.length) {
    postMessage({ type: "scryfall-lookup", data: `missing ${missingCards.length} cards` })
    console.log(missingCards)
    //   search scryfall
  }

  return nameToOracleId
}

