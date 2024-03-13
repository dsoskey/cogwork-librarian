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

  console.time("generate nameToOracleId")
  const nameToOracleId = await lookupCards(foundCubes, foundNames)
  console.timeEnd("generate nameToOracleId")

  postMessage({ type: "generate-cube-definitions" })

  const last_updated = new Date()
  const cubeDefinitions: CubeDefinition[] = Object.entries(foundCubes)
    .map(([key, names]) => ({
      key,
      oracle_ids: names.map(it => nameToOracleId[it]).filter(it => it !== undefined),
      source,
      last_updated,
    }))

  postMessage({ type: "save-to-db" })

  await cogDB.cube.bulkPut(cubeDefinitions)

  postMessage({ type: "end" })
}

async function lookupCards(
  foundCubes: { [cubeId: string]: string[] },
  foundNames: Set<string>,
): Promise<{ [name: string]: string}> {
  postMessage({ type: "card-lookup" })

  const nameToOracleId: { [name: string]: string } = {}
  const foundCards: Set<string> = new Set()

  const filter = not(isOracleVal("extra"))
  const addToFoundCards = (card: NormedCard) => {
    if (filter(card)) {
      if (foundNames.has(card.name)) {
        nameToOracleId[card.name] = card.oracle_id
        foundCards.add(card.name)
      } else {
        const split = card.name.split(" // ")
        if (foundNames.has(split[0])) {
          nameToOracleId[split[0]] = card.oracle_id
          foundCards.add(split[0])
        }
        if (foundNames.has(split[1])) {
          nameToOracleId[split[1]] = card.oracle_id
          foundCards.add(split[1])
        }
      }
    }
  }

  await cogDB.card.each(addToFoundCards)

  const missingCards = Array.from(foundNames).filter(it => !foundCards.has(it))
Scry.Card
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

