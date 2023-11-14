import { CubeDefinition } from '../types/cube'
import { IllustrationTag, OracleTag } from '../types/tag'

export interface DataProvider {
  getCube: (key: string) => Promise<CubeDefinition>
  getOtag: (key: string) => Promise<OracleTag>
  getAtag: (key: string) => Promise<IllustrationTag>
}

interface MemoryDataProviderParams {
  cubes: CubeDefinition[]
  otags: OracleTag[]
  atags: IllustrationTag[]
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

  constructor({ cubes, otags, atags }: MemoryDataProviderParams) {
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
  }
}