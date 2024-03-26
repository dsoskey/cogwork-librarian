import { importCubeCobra } from './cubeListImport'
import {
  CubeDefinition, ExternalCubeSource,
  isOracleVal, not,
  normCardList, NormedCard, Card,
} from 'mtgql'
import { cogDB } from '../local/db'
import * as Scry from 'scryfall-sdk'
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
  const foundCubes: { [cubeId: string]: string[] } = {}
  const foundNames = new Set<string>()
  const missingCubes: string[] = []

  const importCubes = source === "cubecobra" ? importCubeCobra : importCubeArtisan
  const results = await Promise.allSettled(cubeIds.map(importCubes))
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

  if (missingCubes.length) {
    postMessage({ type: "error-missing-cubes", data: missingCubes })
    return
  }

  console.time("generate nameToIds")
  const nameToIds = await lookupCards(foundCubes, foundNames)
  console.timeEnd("generate nameToIds")

  postMessage({ type: "generate-cube-definitions" })

  const last_updated = new Date()
  const cubeDefinitions: CubeDefinition[] = Object.entries(foundCubes)
    .map(([key, names]) => ({
      key,
      oracle_ids: names.map(it => nameToIds[it].oracle_id).filter(it => it !== undefined),
      print_ids: names.map(it => nameToIds[it].print_id).filter(it => it !== undefined),
      source,
      last_updated,
    }))

  postMessage({ type: "save-to-db" })

  await cogDB.cube.bulkPut(cubeDefinitions)

  postMessage({ type: "end" })
}

interface CardIds {
  oracle_id: string
  print_id: string
}
async function lookupCards(
  foundCubes: { [cubeId: string]: string[] },
  foundNames: Set<string>,
): Promise<{ [name: string]: CardIds}> {
  postMessage({ type: "card-lookup" })

  const nameToOracleId: { [name: string]: CardIds } = {}
  const foundCards: Set<string> = new Set()

  const filter = not(isOracleVal("extra"))
  const addToFoundCards = (card: NormedCard) => {
    if (filter(card)) {
      if (foundNames.has(card.name)) {
        nameToOracleId[card.name] = {
          oracle_id: card.oracle_id,
          print_id: card.printings[0].id
        }
        foundCards.add(card.name)
      } else {
        const split = card.name.split(" // ")
        if (foundNames.has(split[0])) {
          nameToOracleId[split[0]] = {
            oracle_id: card.oracle_id,
            print_id: card.printings[0].id
          }
          foundCards.add(split[0])
        }
        if (foundNames.has(split[1])) {
          nameToOracleId[split[1]] = {
            oracle_id: card.oracle_id,
            print_id: card.printings[0].id
          }
          foundCards.add(split[1])
        }
      }
    }
  }

  await cogDB.card.each(addToFoundCards)

  const missingCards = Array.from(foundNames).filter(it => !foundCards.has(it))

  if (missingCards.length) {
    postMessage({ type: "scryfall-lookup", data: `missing ${missingCards.length} cards` })
    const cards = await Scry.Cards.collection(...missingCards.map(name => ({name}))).waitForAll()
    if (cards.not_found.length) {
      const notFound = new Set(cards.not_found.map(it => it.name))
      const missingCubeCards = {};
      for (const key in foundCubes) {
        const inCube = foundCubes[key].filter(notFound.has)
        if (inCube.length > 0) {
          missingCubeCards[key] = inCube
        }
      }
      postMessage({
        type: "scryfall-cards-missing",
        data: {
          missingCubeCards,
          count: cards.not_found.length,
        }})
    } else {
      for (const card of cards) {
        const normed = normCardList([card as Card])[0]
        addToFoundCards(normed)
      }
    }
  }

  return nameToOracleId
}

