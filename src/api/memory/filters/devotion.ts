import { FilterRes } from '../filterBase'
import { NormedCard } from '../types/normedCard'
import { ManaSymbol, toManaCost, toSplitCost } from '../types/card'
import { isVal } from './is'
import { Operator } from '../oracleFilter'


export const devotionOperation = (operator: Operator, pips: string[]): FilterRes<NormedCard> => {
  return {
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
          switch (operator) {
            case '<=':
              return cost[pip] <= count
            case '<':
              return cost[pip] < count
            case '>':
              return cost[pip] > count
            case ':':
            case '>=':
              return cost[pip] >= count
            case '=':
              return cost[pip] === count
            case '!=':
            case '<>':
              return cost[pip] !== count
          }
        })
      return cardCosts.length > 0
    }
  }
}