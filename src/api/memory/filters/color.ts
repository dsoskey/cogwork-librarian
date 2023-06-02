import { FilterNode, Operator } from './base'
import { NormedCard } from '../types/normedCard'
import { oracleNode } from './oracle'

export const colorMatch = (operator: Operator, value: Set<string>): FilterNode => oracleNode({
  filtersUsed: ['color'],
  filterFunc: (card: NormedCard) => {
      const faceMatchMap = [
        card.colors,
        ...card.card_faces.map((it) => it.colors),
      ]
        .filter((it) => it !== undefined)
        .map((colors) => colors.map((it) => it.toLowerCase()))
        .map((colors) => ({
          match: colors.filter((color) => value.has(color)),
          not: colors.filter((color) => !value.has(color)),
        }))
      switch (operator) {
        case '=':
          return (
            faceMatchMap.filter(
              (it) => it.match.length === value.size && it.not.length === 0
            ).length > 0
          )
        case '!=': // ????? This looks wrong
          return faceMatchMap.filter((it) => it.match.length === 0).length > 0
        case '<':
          return (
            faceMatchMap.filter(
              (it) => it.not.length === 0 && it.match.length < value.size
            ).length > 0
          )
        case '<=':
          return (
            faceMatchMap.filter(
              (it) => it.not.length === 0 && it.match.length <= value.size
            ).length > 0
          )
        case '>':
          return (
            faceMatchMap.filter(
              (it) => it.not.length > 0 && it.match.length === value.size
            ).length > 0
          )
        // Scryfall adapts ":" to the context. in this context it acts as >=
        case ':':
        case '>=':
          return (
            faceMatchMap.filter((it) => it.match.length === value.size).length > 0
          )
        case '<>':
          throw Error('<> is not a valid operator for color filter')
      }
    },
})