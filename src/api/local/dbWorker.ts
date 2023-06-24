import { cogDB, toManifest } from './db'
import { downloadCards, putFile } from './populate'
import * as Scry from 'scryfall-sdk'

self.onmessage = (_event) => {
  const event = _event.data

  console.log('received event', event)
  if (event.type === 'load') {
    loadDb().catch(e => postMessage({ type: 'error', data: e.toString() }))
  } else if (event.type === 'init') {
    initDb().catch(e => postMessage({ type: 'error', data: e.toString() }))
  } else {
    console.error("unknown db worker event")
  }
}

async function loadDb() {
  let index = 0
  console.debug("pulling collection")
  const manifest  = (
    await cogDB.collection.limit(1).toArray()
  )[0]
  postMessage({ type: 'manifest', data: manifest })

  const count = await cogDB.card.count()
  postMessage({ type: 'count', data: count })
  await cogDB.card.each(card => {
    index++
    postMessage({ type: 'card', data: { card, index } })
  })
  postMessage({ type: 'end' })
}

async function initDb() {
  const bulkDataDefinition = await Scry.BulkData.definitionByType(
    'default_cards'
  )
  const manifest = toManifest(bulkDataDefinition)
  postMessage({ type: 'manifest', data: manifest })
  const res = await downloadCards(bulkDataDefinition)
  for (const card of res) {
    // index 1 ignores print statement
    postMessage({ type: 'card', data: { card, index: 1 } })
  }
  postMessage({ type: 'end' })

  await putFile(manifest, res)

}