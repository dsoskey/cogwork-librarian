import { FilterNode, Operator } from './base'
import { NormedCard } from '../types/normedCard'
import { ManaSymbol, toManaCost, toSplitCost } from '../types/card'
import { isVal } from './is'
import { oracleNode } from './oracle'


export const devotionOperation = (operator: Operator, pips: string[]): FilterNode =>
  oracleNode({
    filtersUsed: ['devotion'],
    filterFunc: (card: NormedCard) => {
      const pip: ManaSymbol = pips[0].toLowerCase() as ManaSymbol
      const count = pips.length
      if (!(isVal('permanent').filterFunc(card))) return false

      const cardCosts = [
        card.mana_cost,
        ...card.card_faces.map((it) => it.mana_cost),
      ]
        .filter((it) => it !== undefined)
        .filter((rawCost) => {
          const cost = toManaCost(toSplitCost(rawCost))
          const compareValue = cost[pip] ?? 0
          switch (operator) {
            case '<=':
              return compareValue <= count
            case '<':
              return compareValue < count
            case '>':
              return compareValue > count
            case ':':
            case '>=':
              return compareValue >= count
            case '=':
              return compareValue === count
            case '!=':
            case '<>':
              return compareValue !== count
          }
        })
      return cardCosts.length > 0
    }
  })