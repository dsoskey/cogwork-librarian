import { Card, SortFunctions } from 'mtgql'

export enum PlotFunction {
  year,
  wordCount,
  fullWordCount,
  cmc,

}

interface PlotFunctionRepresentation {
  getDatum: (card: Card) => number
  text: string
  range?: [number, number],
  categories?: string[],
  binSize?: number,
}

export const plotFunctionLookup: Record<PlotFunction, PlotFunctionRepresentation> = {
  [PlotFunction.year]: {
    getDatum: card => SortFunctions.byReleased(card).getFullYear(),
    text: 'year'
  },
  [PlotFunction.wordCount]: {
    getDatum: card => {
      const result = SortFunctions.byWordCount(card)
      return isNaN(result) ? 0 : result
    },
    text: 'word count',
    binSize: 1
  },
  [PlotFunction.fullWordCount]: {
    getDatum: card => {
      const result = SortFunctions.byFullWordCount(card)
      return isNaN(result) ? 0 : result
    },
    text: 'full word count',
    binSize: 1
  },
  [PlotFunction.cmc]: {
    getDatum: card => card.cmc ?? 0,
    text: 'mana value',
    binSize: 1
  }
}