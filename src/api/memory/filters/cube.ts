import { FilterNode } from './base'
import { NormedCard } from '../types/normedCard'

export const cubeFilter = (cubeKey: string): FilterNode<NormedCard> => {
  const rawCards = localStorage.getItem(`${cubeKey}.cube.coglib.sosk.watch`)
  if (rawCards === null) {
    console.warn(`Unknown cube key (${cubeKey})`) // todo: tokenize noQuoteString
  }
  const cardSet = new Set<string>(rawCards === null ? [] : JSON.parse(rawCards))
  return {
    filtersUsed: ['cube'],
    filterFunc: (card: NormedCard) => {
      if (rawCards === null) throw Error(`Unknown cube key (${cubeKey})`)
      return cardSet.has(card.oracle_id)
    }
  }
}