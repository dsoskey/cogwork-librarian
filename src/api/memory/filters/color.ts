import { defaultCompare, FilterNode, Operator } from './base'
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
        // Scryfall adapts ":" to the context. in this context it acts as >= for non-colorless color sets
        // For colorless, ":" acts as "="
        case ':':
          if (value.size === 0) {
            return faceMatchMap.filter(
              (it) => it.match.length === value.size && it.not.length === 0
            ).length > 0
          }
        case '>=':
          return (
            faceMatchMap.filter((it) => it.match.length === value.size).length > 0
          )
        case '<>':
          throw Error('<> is not a valid operator for color filter')
      }
    },
})

// c=1 takes ~5s
export const colorCount = (operator: Operator, count: number): FilterNode => oracleNode({
  filtersUsed: ['color-count'],
  filterFunc: (it) => {
    const colorSet: Set<String> = new Set(it.colors ?? [])
    for (const face of it.card_faces) {
      for (const color of (face.colors ?? [])) {
        colorSet.add(color)
      }
    }
    const colorCount = colorSet.size

    return defaultCompare(colorCount, operator, count)
  }
})