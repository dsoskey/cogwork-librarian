import { CubeDefinition } from '../types/cube'
import { IllustrationTag, OracleTag } from '../types/tag'
import { Block } from '../types/block'

export interface DataProvider {
  getCube: (key: string) => Promise<CubeDefinition>
  getOtag: (key: string) => Promise<OracleTag>
  getAtag: (key: string) => Promise<IllustrationTag>
  getBlock: (key: string) => Promise<Block>
}

interface MemoryDataProviderParams {
  cubes: CubeDefinition[]
  otags: OracleTag[]
  atags: IllustrationTag[]
  blocks: Block[]
}
export class MemoryDataProvider implements DataProvider {
  private readonly cubes: { [key: string]: CubeDefinition }
  getCube(key: string): Promise<CubeDefinition> {
    return Promise.resolve(this.cubes[key])
  }

  private readonly otags: { [key: string]: OracleTag }
  getOtag(key: string): Promise<OracleTag> {
    return Promise.resolve(this.otags[key])
  }

  private readonly atags: { [key: string]: IllustrationTag }
  getAtag(key: string): Promise<IllustrationTag> {
    return Promise.resolve(this.atags[key])
  }

  private readonly blocks: { [key: string]: Block }
  getBlock(key: string): Promise<Block> {
    return Promise.resolve(this.blocks[key])
  }

  constructor({ cubes, otags, atags, blocks }: MemoryDataProviderParams) {
    this.cubes = {}
    for (const cube of cubes) {
      this.cubes[cube.key] = cube;
    }
    this.otags = {}
    for (const otag of otags) {
      this.otags[otag.label] = otag;
    }
    this.atags = {}
    for (const atag of atags) {
      this.atags[atag.label] = atag;
    }
    this.blocks = {}
    for (const block of blocks) {
      this.blocks[block.block_code] = block
      this.blocks[block.block.toLowerCase()] = block;
    }
  }
}