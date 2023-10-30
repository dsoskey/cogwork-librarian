import { cogDB, MANIFEST_ID, toManifest } from './db'
import { downloadCards } from './populate'
import * as Scry from 'scryfall-sdk'
import { downloadIllustrationTags, downloadOracleTags } from '../scryfall/tagger'
import { normCardList, NormedCard } from '../memory/types/normedCard'
import { BulkDataType } from 'scryfall-sdk/out/api/BulkData'
import { ImportTarget } from '../../ui/data/cardDataView'

self.onmessage = (_event) => {
  const event = _event.data

  console.log('received event', event)
  switch (event.type) {
    case 'load':
      loadDb().catch(e => postMessage({ type: 'error', data: e.toString() }))
      break;
    case 'init': // idea: this event data has manifest OR type name to fetch
      const { bulkType, targets } = event.data
      initDb(bulkType ?? 'default_cards', targets).catch(e => postMessage({ type: 'error', data: e.toString() }))
      break;
    case 'load-oracle-tags':
      loadOracleTags().catch(e => postMessage({ type: 'error', data: e.toString() }))
      break;
    case 'load-illustration-tags':
      loadIllustrationTags().catch(e => postMessage({ type: 'error', data: e.toString() }))
      break;
    default:
      console.error('unknown db worker event')
      break;
  }
}

async function loadDb() {
  let index = 0
  console.debug("pulling collection")
  const manifest  = await cogDB.collection.get("the_one")
  postMessage({ type: 'manifest', data: manifest })

  await cogDB.cube.each(({ key, oracle_ids }) => {
    postMessage({ type: 'cube', data: { key, values: oracle_ids }})
  })
  postMessage({ type: "cube-end"})
  await cogDB.oracleTag.each(({ label, oracle_ids }) => {
    postMessage({ type: 'otag', data: { key: label, values: oracle_ids }})
  })
  postMessage({ type: "oracle-tag-end"})
  await cogDB.illustrationTag.each(({ label, illustration_ids }) => {
    postMessage({ type: 'atag', data: { key: label, values: illustration_ids }})
  })
  postMessage({ type: "illustration-tag-end"})

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

  await loadOracleTags()

  await loadIllustrationTags()

  const res = normCardList(cards)
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

  postMessage({ type: 'db-end' })
}

async function loadOracleTags() {
  const tags = await downloadOracleTags()
  postMessage({ type: "oracle-tag-downloaded", data: tags.length })
  await cogDB.oracleTag.bulkPut(tags)
  for (const tag of tags) {
    postMessage({ type: "oracle-tag", data: { key: tag.label, values: tag.oracle_ids }})
  }
  postMessage({ type: 'oracle-tag-end' })
}

async function loadIllustrationTags() {
  const tags = await downloadIllustrationTags()
  postMessage({ type: "illustration-tag-downloaded", data: tags.length })
  await cogDB.illustrationTag.bulkPut(tags)
  for (const tag of tags) {
    postMessage({ type: "illustration-tag", data: { key: tag.label, values: tag.illustration_ids }})
  }
  postMessage({ type: 'illustration-tag-end' })
}