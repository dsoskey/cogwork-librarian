import { Card, SortFunctions } from 'mtgql'
import { getColors } from '../../cubeView/searchTable/tempColorUtil'

import { EnrichedCard, SCORE_PRECISION } from '../../../api/queryRunnerCommon'
export enum PlotFunction {
  year,
  wordCount,
  fullWordCount,
  cmc,
  weight,
}

interface PlotFunctionRepresentation {
  getDatum: (card: Card | EnrichedCard) => number | string
  text: string
  range?: [number, number],
  categories?: string[],
  binSize?: number,
}

export const PLOT_FUNCTIONS: Record<PlotFunction, PlotFunctionRepresentation> = {
  [PlotFunction.year]: {
    getDatum: card => SortFunctions.byReleased("data" in card ? card.data : card).getFullYear(),
    text: 'year'
  },
  [PlotFunction.wordCount]: {
    getDatum: card => {
      const result = SortFunctions.byWordCount("data" in card ? card.data : card)
      return isNaN(result) ? 0 : result
    },
    text: 'word count',
    binSize: 1
  },
  [PlotFunction.fullWordCount]: {
    getDatum: card => {
      const result = SortFunctions.byFullWordCount("data" in card ? card.data : card)
      return isNaN(result) ? 0 : result
    },
    text: 'full word count',
    binSize: 1
  },
  [PlotFunction.cmc]: {
    getDatum: card => ("data" in card ? card.data : card).cmc ?? 0,
    text: 'mana value',
    binSize: 1
  },
  [PlotFunction.weight]: {
    getDatum: card => "weight" in card ? Number.parseFloat(card.weight.toPrecision(SCORE_PRECISION)) : 1,
    text: "search weight",
  }
}

export enum GroupFunction {
  none,
  simpleColor,
  cmc,
  rarity,
}

export interface GroupMetadata {
  color?: string,
  order: number,
}

export interface GroupFunctionRepresentation {
  text: string
  getGroup: (card: Card | EnrichedCard) => string | number
  getGroupMetadata: (group: string | number) => GroupMetadata
}

export const GROUP_FUNCTIONS: Record<GroupFunction, GroupFunctionRepresentation> = {
  [GroupFunction.none]: {
    text: "no grouping",
    getGroup: () => 1,
    getGroupMetadata: () => ({ order: 1 }),
  },
  [GroupFunction.simpleColor]: {
    text: "color",
    getGroup: colorKey,
    getGroupMetadata: (group: string | number) => {
      const colors = {
        w: { color: "#f5f5f5", order: 6 },
        u: { color: "#30e7ff", order: 5 },
        b: { color: "#bd7dfc", order: 4 },
        r: { color: "#ff7b7d", order: 3 },
        g: { color: "#32cd32", order: 2 },
        m: { color: "#ffdf78", order: 1 },
        c: { color: "silver", order: 0 },
      }
      return colors[group] ?? { order: -1 }
    }
  },
  [GroupFunction.cmc]: {
    text: "mana value",
    getGroup: (card: Card | EnrichedCard) => ("data" in card ? card.data : card).cmc,
    getGroupMetadata: (group: number) => {
      const style = getComputedStyle(document.documentElement)
      let active = style.getPropertyValue('--active')

      return {
        color: `color-mix(in oklch , ${active}, black ${group > 7 ? group * 3.75 : group * 4.2}%)`,
        order: group,
      }
    }
  },
  [GroupFunction.rarity]: {
    text: "rarity",
    getGroup: (card: Card | EnrichedCard) => ("data" in card ? card.data : card).rarity,
    getGroupMetadata: (group: string) => {
      switch (group) {
        case "common": return { order: 6, color: "#f5f5f5"}
        case "uncommon": return { order: 5, color: "#99ABB6"}
        case "rare": return { order: 4, color: "#D5B478"}
        case "special": return { order: 3, color: "#745890"}
        case "mythic": return { order: 2, color: "#d8510b"}
        case "bonus": return { order: 1, color: "goldenrod" }
      }
    }
  }
}

export function colorKey(card: Card | EnrichedCard): string {
  let key: string;
  let colors = getColors("data" in card ? card.data : card)
  if (colors.length === 0) {
    key = "c";
  } else if (colors.length > 1) {
    key = "m";
  } else {
    key = colors[0].toLowerCase()
  }
  return key
}