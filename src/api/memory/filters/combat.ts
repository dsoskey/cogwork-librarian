import { NormedCard, OracleKeys } from '../types/normedCard'
import { defaultCompare, FilterNode } from './base'
import { Operator } from '../oracleFilter'
import { parsePowTou } from '../types/card'

export const combatOperation =
  (
    field: OracleKeys,
    operator: Operator,
    targetValue: number
  ): FilterNode<NormedCard> => ({
    filtersUsed: [field],
    filterFunc: (card: NormedCard) => {
      const cardValue = card[field]
      if (cardValue === undefined) {
        return false
      }
      return defaultCompare(parsePowTou(cardValue), operator, targetValue)
    }
  })


export const powTouTotalOperation = (
  operator: Operator,
  targetValue: number
): FilterNode<NormedCard> => ({
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