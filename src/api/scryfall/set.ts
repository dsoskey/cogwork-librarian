import { Block } from '../local/db'

export async function downloadSets(): Promise<Block[]> {
  const response = await fetch("https://api.scryfall.com/sets")
  const text = await response.text()
  const jsoned = JSON.parse(text).data as any[];
  const blocks: { [key: string]: Block } = {};
  for (const c of jsoned) {
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
  return Object.values(blocks)
}