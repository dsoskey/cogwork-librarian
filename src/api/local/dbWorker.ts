import { cogDB, MANIFEST_ID, toManifest } from './db'
import { downloadCards } from './populate'
import * as Scry from 'scryfall-sdk'
import { downloadOracleTags } from '../scryfall/tagger'
import { invertTags } from '../memory/types/tag'
import { invertCubes } from '../memory/types/cube'
import { normCardList, NormedCard } from '../memory/types/normedCard'
import { BulkDataType } from 'scryfall-sdk/out/api/BulkData'
import { ImportTarget } from '../../ui/data/cardDataView'

self.onmessage = (_event) => {
  const event = _event.data

  console.log('received event', event)
  if (event.type === 'load') {
    loadDb().catch(e => postMessage({ type: 'error', data: e.toString() }))
  } else if (event.type === 'init') {
    // idea: this event data has manifest OR type name to fetch
    const { bulkType, targets } = event.data
    initDb(bulkType ?? "default_cards", targets).catch(e => postMessage({ type: 'error', data: e.toString() }))
  } else if (event.type === 'load-oracle-tags') {
    loadOracleTags().catch(e => postMessage({ type: 'error', data: e.toString() }))
  } else {
    console.error("unknown db worker event")
  }
}

async function loadDb() {
  let index = 0
  console.debug("pulling collection")
  const manifest  = await cogDB.collection.get("the_one")
  postMessage({ type: 'manifest', data: manifest })

  const count = await cogDB.card.count()
  postMessage({ type: 'count', data: count })
  await cogDB.card.each(card => {
    index++
    postMessage({ type: 'card', data: { card, index } })
  })
  postMessage({ type: 'end' })
}

async function initDb(type: BulkDataType, targets: ImportTarget[]) {
  if (targets.length === 0) {
    throw Error("No targets specified!")
  }
  const bulkDataDefinition = await Scry.BulkData.definitionByType(type)
  const manifest = toManifest(bulkDataDefinition)
  postMessage({ type: 'manifest', data: { manifest, shouldSetManifest: targets.find(it => it === 'memory') }})

  const cards = await downloadCards(bulkDataDefinition)
  postMessage({ type: "downloaded-cards" })

  const cubes = await cogDB.cube.toArray()
  const invertedCubes = invertCubes(cubes)
  postMessage({ type: "loaded-cubes" })

  const oracleTags = await downloadOracleTags()
  const invertedOracleTags = invertTags(oracleTags)
  postMessage({ type: "downloaded-otags" })

  const res = normCardList(cards, invertedCubes, invertedOracleTags)
  postMessage({ type: "normed-cards", data: res.length })

  if (targets.find(it => it === 'memory')) {
    let index = 0
    for (const card of res) {
      index++
      postMessage({ type: 'card', data: { card, index } })
    }
  }
  postMessage({ type: 'memory-end' })

  if (targets.find(it => it === 'db')) {
    const toSave: NormedCard[] = []
    for (const card of res) {
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

    await cogDB.transaction("rw", cogDB.collection, cogDB.card, cogDB.oracleTag, async () => {
      await cogDB.collection.put({
        ...manifest,
        id: MANIFEST_ID,
        blob: new Blob([]),
      })
      await cogDB.card.clear()
      await cogDB.card.bulkPut(toSave)
      postMessage({ type: "saved-cards" })
      await cogDB.oracleTag.clear()
      await cogDB.oracleTag.bulkPut(oracleTags)
    })
  }

  postMessage({ type: 'db-end' })
}

async function loadOracleTags() {
  const tags = await downloadOracleTags()
  const cardIdToTags = invertTags(tags)

  postMessage({ type: "oracle-tags-downloaded", data: tags.length })
  let index = 0
  await cogDB.transaction("rw", cogDB.oracleTag, cogDB.card, async () => {
    await cogDB.oracleTag.bulkPut(tags)
    const cardCount = await cogDB.card.count()
    postMessage({ type: "oracle-tags-put", data: cardCount })
    await cogDB.card.toCollection().modify(card => {
      card.oracle_tags = {}
      for (const tag of cardIdToTags[card.oracle_id] ?? []) {
        card.oracle_tags[tag] = true
      }
      index++
      postMessage({ type: "oracle-tags-card-saved", data: index })
    })
  })

  postMessage({ type: 'end' })
}