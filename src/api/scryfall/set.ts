import { Block, CardSet } from 'mtgql'
import { SCRYFALL_BASE_URI } from './constants'

export interface BulkSetInfo {
  sets: CardSet[]
  blocks: Block[]
}
export async function downloadSets(): Promise<BulkSetInfo> {
  const response = await fetch(`${SCRYFALL_BASE_URI}/sets`)
  const text = await response.text()
  const cardSets = JSON.parse(text).data as CardSet[];
  const blocks: { [key: string]: Block } = {};
  for (const c of cardSets) {
    if (c.block_code !== undefined) {
      if (blocks[c.block_code] === undefined) {
        blocks[c.block_code] = {
          block: c.block.toLowerCase(),
          block_code: c.block_code,
          set_codes: [c.code]
        }
      } else {
        blocks[c.block_code].set_codes.push(c.code)
      }
    }
  }
  return {
    sets: cardSets,
    blocks: Object.values(blocks),
  }
}