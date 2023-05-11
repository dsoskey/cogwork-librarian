import { FilterNode, Operator } from './base'
import { NormedCard } from '../types/normedCard'
import { toManaCost, toSplitCost } from '../types/card'
import isEqual from 'lodash/isEqual'

// optimization opportunity
export const manaCostMatch =
  (operator: Operator, value: string[]): FilterNode<NormedCard> => ({
    filtersUsed: ['mana'],
    filterFunc: (card: NormedCard) => {
      const targetCost = toManaCost(value)
      const entries = Object.entries(targetCost)
      const cardCosts = [
        card.mana_cost,
        ...card.card_faces.map((it) => it.mana_cost),
      ]
        .filter((rawCost) => {
          if (rawCost === undefined) return false
          const cost = toManaCost(toSplitCost(rawCost))
          switch (operator) {
            case '=':
              return isEqual(cost, targetCost)
            case '!=':
            case '<>':
              return !isEqual(cost, targetCost)
            case '<':
              return (
                entries.filter(([key, val]) => cost[key] < val).length > 0 &&
                entries.filter(([key, val]) => cost[key] > val).length === 0
              )
            case '<=':
              return entries.filter(([key, val]) => cost[key] > val).length === 0
            case '>':
              return (
                entries.filter(([key, val]) => cost[key] > val).length > 0 &&
                entries.filter(([key, val]) => cost[key] < val).length === 0
              )
            case ':':
            case '>=':
              return entries.filter(([key, val]) => cost[key] < val).length === 0
          }
        })
      return cardCosts.length > 0
    }
  })
