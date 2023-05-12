import { NormedCard, OracleKeys } from '../types/normedCard'
import { FilterNode, defaultCompare, Operator } from './base'
import { parsePowTou } from '../types/card'
import { oracleNode } from './oracle'

export const combatToCombatNode = (
  field: OracleKeys,
  operator: Operator,
  rawTarget: number | 'power' | 'pow' | 'toughness' | 'tou'
): FilterNode => {
  return oracleNode({
    filtersUsed: [field],
    filterFunc: (card: NormedCard) => {
      const cardValue = card[field]
      let targetValue: number
      switch (rawTarget) {
        case 'pow':
        case 'power':
          targetValue = parsePowTou(card.power)
          break
        case 'toughness':
        case 'tou':
          targetValue = parsePowTou(card.toughness)
          break
        default:
          targetValue = rawTarget
      }
      if (card.name === "Swooping Lookout") {
        console.log(card)
      }
      if (cardValue === undefined || targetValue === undefined) {
        return false
      }
      return defaultCompare(parsePowTou(cardValue), operator, targetValue)
    }
  })
}


export const powTouTotalOperation = (
  operator: Operator,
  targetValue: number
): FilterNode => oracleNode({
  filtersUsed: ['powtou'],
  filterFunc: (card) => {
    const faces = [
      {
        power: card.power,
        toughness: card.toughness,
      },
      ...card.card_faces.map((jt) => ({
        power: jt.power,
        toughness: jt.toughness,
      })),
    ]

    return (
      faces
        .filter((it) => it.toughness !== undefined && it.power !== undefined)
        .map(
          ({ power, toughness }) => parsePowTou(power) + parsePowTou(toughness)
        )
        .filter((faceValue) => defaultCompare(faceValue, operator, targetValue))
        .length > 0
    )
  },
})