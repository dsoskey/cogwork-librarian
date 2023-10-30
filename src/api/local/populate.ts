import { Card } from 'scryfall-sdk'
import { cogDB, Manifest, MANIFEST_ID } from './db'
import { NormedCard } from '../memory/types/normedCard'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
import { CubeDefinition } from '../memory/types/cube'


export const downloadCards = async (manifest: BulkDataDefinition) => {

  const download = await fetch(manifest.download_uri, { method: 'GET' })

  const results: Array<Card> = (await download.json()).map(Card.construct)

  return results
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
      id: MANIFEST_ID,
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
      source: "list",
      last_updated: new Date(),
    }))


  for await (const cube of existingCubes) {
    await cogDB.cube.put(cube)
    localStorage.removeItem(`${cube.key}${cubeNamespace}`)
  }
}