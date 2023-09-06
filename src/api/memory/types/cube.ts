export interface CubeDefinition {
  key: string,
  oracle_ids: string[],
  source: "list" | "cubecobra" | "cubeartisan"
  last_updated: Date
}

export type CardIdToCubeIds = { [key: string]: string[] }

export const invertCubes = (cubes: CubeDefinition[]): CardIdToCubeIds => {
  const result = {}
  for (const cube of cubes) {
    for (const card_id of cube.oracle_ids) {
      if (result[card_id] === undefined) {
        result[card_id] = [cube.key]
      } else {
        result[card_id].push(cube.key)
      }
    }
  }
  return result
}