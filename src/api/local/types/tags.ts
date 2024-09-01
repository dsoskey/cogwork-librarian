import { IllustrationTag, OracleTag } from 'mtgql'

export function invertOtags(tags: OracleTag[]): CardToOracleTag[] {
  const result: { [key: string]: CardToOracleTag } = {}
  for (const tag of tags) {
    for (const card_id of tag.oracle_ids) {
      if (result[card_id] === undefined) {
        result[card_id] = { oracle_id: card_id, otags: [tag.label] }
      } else {
        result[card_id].otags.push(tag.label)
      }
    }
  }
  return Object.values(result)
}

export interface CardToOracleTag {
  oracle_id: string
  otags: string[]
}

export function invertItags(tags: IllustrationTag[]): CardToIllustrationTag[] {
  const result: { [key: string]: CardToIllustrationTag } = {}
  for (const tag of tags) {
    for (const card_id of tag.illustration_ids) {
      if (result[card_id] === undefined) {
        result[card_id] = { id: card_id, itags: [tag.label] }
      } else {
        result[card_id].itags.push(tag.label)
      }
    }
  }
  return Object.values(result)
}

export interface CardToIllustrationTag {
  id: string
  itags: string[]
}