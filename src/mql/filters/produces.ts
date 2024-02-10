import { Filter, Operator } from './base'
import { NormedCard } from '../types/normedCard'

export const producesMatch =
  (operator: Operator, value: Set<string>): Filter<NormedCard> =>
    (card: NormedCard) => {
      // scryfall includes these cards in when operator is != for some reason
      if (card.produced_mana === undefined) return false

      const lower = card.produced_mana.map(it => it.toLowerCase())
      const match = lower.filter(color => value.has(color))
      const matchnt = lower.filter(color => !value.has(color))

      switch (operator) {
        case '=':
          return match.length === value.size && matchnt.length === 0
        case '!=':
          return match.length !== value.size || matchnt.length > 0
        case '<':
          return matchnt.length === 0 && match.length < value.size
        case '<=':
          return matchnt.length === 0 && match.length <= value.size
        case '>':
          return matchnt.length > 0 && match.length === value.size
        // Scryfall adapts ":" to the context. in this context it acts as >=
        case ':':
        case '>=':
          return match.length === value.size
      }
    }

export const producesMatchCount =
  (operator: Operator, count: number): Filter<NormedCard> =>
    (card: NormedCard) => {
      const cardCount = card.produced_mana?.length ?? 0

      switch (operator) {
        case '=':
          return cardCount === count
        case '!=':
          return cardCount !== count
        case '<':
          return cardCount < count
        case '<=':
          return cardCount <= count
        case '>':
          return cardCount > count
        // Scryfall adapts ":" to the context. in this context it acts as >=
        case ':':
        case '>=':
          return cardCount === count
      }
    }