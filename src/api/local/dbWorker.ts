import { cogDB, COGDB_FILTER_PROVIDER, MANIFEST_ID, toManifest } from './db'
import { downloadCards } from './populate'
import * as Scry from 'scryfall-sdk'
import { downloadIllustrationTags, downloadOracleTags } from '../scryfall/tagger'
import { normCardList,
  NormedCard,
  QueryRunner,
  MQLParser,
  FilterNode, identityNode,
} from 'mtgql'
import { BulkDataType } from 'scryfall-sdk/out/api/BulkData'
import { downloadSets } from '../scryfall/set'
import { ImportTarget } from './useCogDB'
import { invertItags, invertOtags } from './types/tags'

self.onmessage = (_event) => {
  const event = _event.data

  console.log('received event', event)
  switch (event.type) {
    case 'load': {
      const { filter } = event.data;
      sendCardDBToMemory(filter).catch(e => postMessage({ type: 'error', data: e.toString() }))
      break;
    }
    case 'init': { // idea: this event data has manifest OR type name to fetch
      const { bulkType, targets, filter } = event.data
      initOfficialDB(bulkType ?? 'default_cards', targets, filter)
        .catch(e => postMessage({ type: 'error', data: e.toString() }))
      break;
    }
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

async function sendCardDBToMemory(filter?: string) {
  let index = 0
  let found = 0;
  console.debug("pulling collection")
  const manifest  = await cogDB.collection.get("the_one")
  postMessage({ type: 'manifest', data: manifest })

  const count = (await cogDB.card.count()) + (await cogDB.customCard.count())
  postMessage({ type: 'count', data: count })
  const node: FilterNode = filter ?
    await QueryRunner.parseFilterNode(MQLParser, COGDB_FILTER_PROVIDER, filter)
      .unwrapOr(identityNode()) :
    identityNode();

  const processCard = (card: NormedCard) =>  {
    index++
    if (node.filterFunc(card)) {
      const printings = [];
      for (let printing of card.printings) {
        if (node.printFilter({ card, printing })) {
          printings.push(printing)
        }
      }
      if (printings.length > 0) {
        found++
        postMessage({ type: 'card', data: { card: {...card, printings}, index } })
      }
    }
  }
  await cogDB.card.each(processCard)
  await cogDB.customCard.each(processCard)

  postMessage({ type: 'count', data: found })
  postMessage({ type: 'end' })
}

async function initOfficialDB(type: BulkDataType, targets: ImportTarget[], filter?: string) {
  if (targets.length === 0) {
    throw Error("No targets specified!")
  }
  const bulkDataDefinition = await Scry.BulkData.definitionByType(type)
  const manifest = toManifest(bulkDataDefinition, filter)
  postMessage({ type: 'manifest', data: { manifest, shouldSetManifest: targets.find(it => it === 'memory') }})

  const cards = await downloadCards(bulkDataDefinition)
  postMessage({ type: "downloaded-cards" })

  await loadOracleTags();
  await loadIllustrationTags();
  await loadSetsAndBlocks();

  let res;
  if (manifest.filter) {
    const qr = new QueryRunner({ corpus: cards, dataProvider: cogDB });
    const result = await qr.search(filter);
    if (result.isOk()) {
      const raw = result._unsafeUnwrap()
      res = normCardList(raw);
      console.debug(`filtered to ${raw.length} cards`)
    } else {
      postMessage({ type: "filter-error", data: result._unsafeUnwrapErr() })
      res = normCardList(cards);
    }
  } else {
    res = normCardList(cards);
  }

  console.debug(res)

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
      console.time("clear cards")
      await cogDB.card.clear()
      console.timeEnd("clear cards")
      console.time("put cards")
      await cogDB.card.bulkPut(toSave)
      console.timeEnd("put cards")
    })
  }

  postMessage({ type: 'db-end' })
}

async function loadOracleTags() {
  const tags = await downloadOracleTags()
  postMessage({ type: "oracle-tag-downloaded", data: tags.length })
  await cogDB.oracleTag.bulkPut(tags)
  const inverted = invertOtags(tags);
  await cogDB.cardToOtag.bulkPut(inverted)
  postMessage({ type: 'oracle-tag-end' })
}

async function loadIllustrationTags() {
  const tags = await downloadIllustrationTags()
  postMessage({ type: "illustration-tag-downloaded", data: tags.length })
  await cogDB.illustrationTag.bulkPut(tags)
  const inverted = invertItags(tags);
  await cogDB.cardToItag.bulkPut(inverted);
  postMessage({ type: 'illustration-tag-end' })
}

async function loadSetsAndBlocks() {
  const { blocks, sets } = await downloadSets()
  postMessage({ type: "sets-downloaded", data: sets.length })
  await cogDB.block.bulkPut(blocks)
  await cogDB.set.bulkPut(sets)
  postMessage({ type: "sets-end" })
}