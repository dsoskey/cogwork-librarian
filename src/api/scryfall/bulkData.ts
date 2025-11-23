import { SCRYFALL_BASE_URI } from './constants'

declare enum BulkDataTypes {
  oracle_cards = 0,
  unique_artwork = 1,
  default_cards = 2,
  all_cards = 3,
  rulings = 4
}
export type BulkDataType = keyof typeof BulkDataTypes;
export interface BulkDataDefinition {
  object: "bulk_data";
  id: string;
  uri: string;
  type: BulkDataType;
  name: string;
  description: string;
  download_uri: string;
  updated_at: string;
  size: number;
  content_type: string;
  content_encoding: string;
}

export async function fetchBulkDataDefinitions(): Promise<BulkDataDefinition[]> {
  const response = await fetch(`${SCRYFALL_BASE_URI}/bulk-data`)

  const json = await response.json()
  return json.data;
}

export async function fetchBulkDataDefinition(type: BulkDataType): Promise<BulkDataDefinition> {
  const response = await fetch(`${SCRYFALL_BASE_URI}/bulk-data/${type}`)
  const json = await response.json()
  console.log(json)
  return await json
}