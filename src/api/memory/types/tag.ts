export type TagType = "oracle" | "illustration"

export interface OracleTag {
  object: "tag"
  type: "oracle"
  id: string
  label: string
  description: string | null
  oracle_ids: string[]
}

export interface IllustrationTag {
  object: "tag"
  type: "illustration"
  id: string
  label: string
  description: string | null
  illustration_ids: string[]
}

export type CardIdToTagLabels = { [key: string]: string[] }

export const invertTags = (tags: OracleTag[]): CardIdToTagLabels => {
  const result = {}
  for (const tag of tags) {
    for (const card_id of tag.oracle_ids) {
      if (result[card_id] === undefined) {
        result[card_id] = [tag.label]
      } else {
        result[card_id].push(tag.label)
      }
    }
  }
  return result
}