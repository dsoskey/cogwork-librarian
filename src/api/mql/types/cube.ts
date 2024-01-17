export type ExternalCubeSource = "cubecobra" | "cubeartisan"
export type CubeSource = "list" | ExternalCubeSource
export const CUBE_SOURCE_OPTIONS: CubeSource[] = ["cubeartisan", "cubecobra", "list"]
export const CUBE_SOURCE_TO_LABEL: Record<CubeSource, string> = {
  cubeartisan: 'CubeArtisan', cubecobra: 'CubeCobra', list: 'a text list'
}


export interface CubeDefinition {
  key: string,
  oracle_ids: string[],
  source: CubeSource
  last_updated: Date
}