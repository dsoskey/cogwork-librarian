import { FilterNode, Operator } from './base'
import { NormedCard } from '../types/normedCard'
import { toManaCost, toSplitCost } from '../types/card'
import isEqual from 'lodash/isEqual'
import { oracleNode } from './oracle'

export function combineHybridSymbols(chars: string[]): string[] {
  const result: string[] = [];
  for (let i = 0; i < chars.length; i++){
    const char = chars[i]
    if (char === "/") {
      if (i > 0 && chars[i-1] !== "/" && ! result[result.length - 1].includes("/") &&
          i < chars.length - 1 && chars[i+1] !== "/"
      ) {
        const left = result.pop()
        const right = chars[++i];
        result.push(`${left}/${right}`)
      }
    } else {
      result.push(char);
    }
  }
  return result
}

// optimization opportunity
export const manaCostMatch =
  (operator: Operator, value: string[]): FilterNode => oracleNode({
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
                // 1. for all of target's mana counts, cost has less than or equal than target
                entries.filter(([key, val]) => (cost[key] ?? 0) <= val).length === entries.length &&
                // 2. at least one mana count is less than the target count
                entries.find(([key, val]) => (cost[key] ?? 0) < val) !== undefined &&
                // 3. cost doesn't have any extra keys
                Object.keys(cost).find(it => targetCost[it] === undefined) === undefined
              )
            case '<=':
              return (
                // 1. for all of target's mana counts, cost has less than or equal than target
                entries.filter(([key, val]) => (cost[key] ?? 0) <= val).length === entries.length &&
                // 2. cost doesn't have any extra keys
                Object.keys(cost).find(it => targetCost[it] === undefined) === undefined
              )
            case '>':
              return (
                // 1. for all of target's mana counts, face has at least that many of the same mana count
                entries.filter(([key, val]) => cost[key] !== undefined && cost[key] >= val).length === entries.length &&
                // 2. either face has additional keys OR more of any of target's mana
                Object.keys(cost).find(key => targetCost[key] === undefined || cost[key] > targetCost[key]) !== undefined
              )
            case ':':
            case '>=':
              return entries.filter(([key, val]) => (cost[key] ?? 0) >= val).length === entries.length
          }
        })
      return cardCosts.length > 0
    }
  })
