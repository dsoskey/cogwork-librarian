import { IllustrationTag, OracleTag } from 'mtgql'

// TODO: This will have to change at some point
const BASE_URL = "https://api.scryfall.com/private/tags/"

export async function downloadOracleTags(): Promise<OracleTag[]> {
  const response = await fetch(`${BASE_URL}oracle`)

  const text = await response.text()
  const jsoned = JSON.parse(text)

  return jsoned.data as OracleTag[]
}

export async function downloadIllustrationTags(): Promise<IllustrationTag[]> {
  const response = await fetch(`${BASE_URL}illustration`)

  const text = await response.text()
  const jsoned = JSON.parse(text)

  return jsoned.data as IllustrationTag[]
}