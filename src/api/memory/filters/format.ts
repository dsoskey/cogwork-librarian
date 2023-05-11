import { Format, Legality } from 'scryfall-sdk/out/api/Cards'
import { NormedCard } from '../types/normedCard'
import { FilterNode } from './base'
import { oracleNode } from './oracle'

export const formatMatch = (legality: Legality, value: Format): FilterNode => oracleNode({
  filtersUsed: [legality.toString()],
  filterFunc: (card: NormedCard) => card.legalities[value] === (legality as unknown as string),
})
