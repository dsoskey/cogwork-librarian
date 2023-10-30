export interface CubeDefinition {
  key: string,
  oracle_ids: string[],
  source: "list" | "cubecobra" | "cubeartisan"
  last_updated: Date
}