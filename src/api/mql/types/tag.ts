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