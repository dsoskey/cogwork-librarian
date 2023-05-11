import { FilterNode, Operator } from './base'
import { NormedCard } from '../types/normedCard'

export const colorIdentityMatch =
  (operator: Operator, value: Set<string>): FilterNode<NormedCard> => ({
    filtersUsed: ['identity'],
    filterFunc: (card: NormedCard) => {
      const colors = card.color_identity.map((it) => it.toLowerCase())
      const matchedColors = colors.filter((color) => value.has(color))
      const notMatchedColors = colors.filter((color) => !value.has(color))
      switch (operator) {
        case '=':
          return (
            matchedColors.length === value.size && notMatchedColors.length === 0
          )
        case '!=':
          return matchedColors.length === 0
        case '<':
          return (
            notMatchedColors.length === 0 && matchedColors.length < value.size
          )
        // Scryfall adapts ":" to the context. in this context it acts as <=
        case ':':
        case '<=':
          return (
            notMatchedColors.length === 0 && matchedColors.length <= value.size
          )
        case '>':
          return (
            notMatchedColors.length > 0 && matchedColors.length === value.size
          )
        case '>=':
          return matchedColors.length === value.size
        case '<>':
          throw 'throw something better please!'
      }
    }
  })
