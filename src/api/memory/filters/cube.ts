import { FilterNode } from './base'
import { NormedCard } from '../types/normedCard'
import { oracleNode } from './oracle'

export const cubeFilter = (cubeKey: string): FilterNode => {
  const rawCards = localStorage.getItem(`${cubeKey}.cube.coglib.sosk.watch`)
  if (rawCards === null) {
    console.warn(`Unknown cube key (${cubeKey})`) // todo: tokenize noQuoteString
  }
  const cardSet = new Set<string>(rawCards === null ? [] : JSON.parse(rawCards))
  return oracleNode({
    filtersUsed: ['cube'],
    filterFunc: (card: NormedCard) => {
      if (rawCards === null) throw Error(`Unknown cube key (${cubeKey})`)
      return cardSet.has(card.oracle_id)
    }
  })
}