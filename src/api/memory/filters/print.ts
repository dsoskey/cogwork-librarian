import { Filter, FilterNode } from './base'
import { Card } from 'scryfall-sdk'
import { NormedCard, Printing, PrintingFilterTuple } from '../types/normedCard'
import { maxBy, minBy } from 'lodash'

export const printNode = (
  filtersUsed: string[],
  printFilter: Filter<PrintingFilterTuple>,
): FilterNode => {
  return {
    filtersUsed,
    filterFunc: (card) => {
      for (const printing of card.printings) {
        if (printFilter({printing,card})) {
          return true
        }
      }
      return false
    },
    inverseFunc: (card) => {
      for (const printing of card.printings) {
        if (!printFilter({printing, card})) {
          return true;
        }
      }
      return false
    },
    printFilter,
  }
}

const showAllFilter = new Set([
  'date',
  'frame',
  'set',
  'setType',
  'usd',
  'eur',
  'tix',
  'language',
  'stamp',
  'watermark',
  'year',
])

export const findPrinting = (prefer?: string) =>
  (filterFunc: Filter<PrintingFilterTuple>) =>
    (card: NormedCard): Card[] => {
      const { printings, ...rest } = card

      const maybePrints = printings.filter(printing => filterFunc({ printing, card }))
      if (maybePrints.length) {
        let print;
        switch (prefer) {
          case "usd-low":
          case "usd-high":
          case "eur-low":
          case "eur-high":
          case "tix-low":
          case "tix-high": {
            const [field, dir] = prefer.split("-")
            const func = dir === "low" ? minBy : maxBy
            print = func(maybePrints, it => Number.parseFloat(it.prices[field]))
            break;
          }
          case "newest":
            print = maybePrints[maybePrints.length - 1];
            break;
          case "oldest":
          default:
            print = maybePrints[0]
        }
        return [Card.construct(<Card>{
          ...rest,
          ...print,
        })]
      }
      return []
    }

export const allPrintings =
  (filterFunc: Filter<PrintingFilterTuple>) =>
    (card: NormedCard): Card[] => {
      const { printings, ...rest } = card
      const filteredPrints: Card[] = []
      for (const printing of printings) {
        if (filterFunc({ printing, card })) {
          filteredPrints.push(Card.construct(<Card>{
            ...rest,
            ...printing,
          }))
        }
      }

      return filteredPrints
    }

export const uniqueArts =
  (filterFunc: Filter<PrintingFilterTuple>) =>
    (card: NormedCard): Card[] => {
      const { printings, ...rest } = card
      const filteredPrints: Printing[] = []
      for (const printing of printings) {
        if (filterFunc({ printing, card })) {
          filteredPrints.push(printing)
        }
      }

      const foundArtIds: Set<string> = new Set<string>()
      const returnedPrints: Printing[] = []
      for (const print of filteredPrints) {
        if (print.illustration_id !== undefined && !foundArtIds.has(print.illustration_id)) {
          foundArtIds.add(print.illustration_id)
          returnedPrints.push(print)
        }
      }
      return returnedPrints.map((it) =>
        Card.construct(<Card>{
          ...rest,
          ...it,
        })
      )
    }


export const chooseFilterFunc = (filterNode: FilterNode) => {
  const { filtersUsed, printFilter } = filterNode
  const firstUnique = filtersUsed.find(filter => filter.startsWith('unique:'))
  const firstPrefer = filtersUsed
    .find(filter => filter.startsWith('prefer:'))
    ?.replace('prefer:', '') ?? undefined;
  if (firstUnique !== undefined) {
    const funcKey = firstUnique.replace('unique:', '')
    switch (funcKey) {
      case 'prints':
        return allPrintings(printFilter)
      case 'art':
        return uniqueArts(printFilter)
      case 'cards':
        return findPrinting(firstPrefer)(printFilter)
      default:
        throw Error(`unknown print filter function ${funcKey}`)
    }
  }
  return findPrinting(firstPrefer)(printFilter)
}