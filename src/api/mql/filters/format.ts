import { Format } from 'scryfall-sdk'
import { NormedCard } from '../types/normedCard'
import { FilterNode } from './base'
import { oracleNode } from './oracle'

type Legality = "legal" | "not_legal" | "restricted" | "banned"
export const formatMatch = (legality: Legality, value: Format): FilterNode => oracleNode({
  filtersUsed: [legality],
  filterFunc: (card: NormedCard) => card.legalities[value] === legality,
})
