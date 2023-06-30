import { Card } from 'scryfall-sdk'
import { cogDB, Manifest } from './db'
import { normCardList, NormedCard } from '../memory/types/normedCard'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
import { CubeDefinition, invertCubes } from '../memory/types/cube'

export const downloadCards = async (
  manifest: BulkDataDefinition
): Promise<NormedCard[]> => {
  const download = await fetch(manifest.download_uri, { method: 'GET' })

  const results: Array<Card> = (await download.json()).map(Card.construct)

  const cubes: CubeDefinition[] = await cogDB.cube.toArray()

  const cardIdToCubes = invertCubes(cubes)

  return normCardList(results, cardIdToCubes)
}
export const putFile = async (manifest: Manifest, data: NormedCard[]) => {
  const toSave: NormedCard[] = []
  for (const card of data) {
    if (card.oracle_id === undefined) {
      console.warn(`card with no oracle_id: ${card.name}`)
      console.debug(card)
    } else if (card.name === undefined) {
      console.warn(`card with no name: ${card.oracle_id}`)
      console.debug(card)
    } else {
      toSave.push(card)
    }
  }

  await cogDB.transaction("rw", cogDB.collection, cogDB.card, async () => {
    await cogDB.collection.put({
      ...manifest,
      lastUpdated: new Date(),
      id: 'the_one',
      blob: new Blob([]),
    })
    await cogDB.card.clear()
    await cogDB.card.bulkPut(toSave)
  })
}

const cubeNamespace = ".cube.coglib.sosk.watch"
export const migrateCubes = async () => {
  const existingCubes: CubeDefinition[] = Object.keys(localStorage)
    .filter(it => it.endsWith(cubeNamespace))
    .map(it => ({
      key: it.slice(0, it.indexOf(".")),
      oracle_ids: JSON.parse(localStorage.getItem(it) ?? "[]"),
    }))


  for await (const cube of existingCubes) {
    await cogDB.addCube(cube)
    localStorage.removeItem(`${cube.key}${cubeNamespace}`)
  }
}