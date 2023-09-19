import { Filter, FilterNode } from './base'
import { Card } from 'scryfall-sdk'
import { NormedCard, Printing, PrintingFilterTuple } from '../types/normedCard'

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

export const findPrinting =
  (filterFunc: Filter<PrintingFilterTuple>) =>
    (card: NormedCard): Card | undefined => {
      const { printings, ...rest } = card
      const maybePrint = printings.find(printing => filterFunc({ printing, card }))
      if (maybePrint !== undefined) {
        return Card.construct(<Card>{
          ...rest,
          ...maybePrint,
        })
      }
      return undefined
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


export const chooseFilterFunc = (filtersUsed: string[]) => {
  const firstUnique = filtersUsed.find(filter => filter.startsWith('unique:'))
  if (firstUnique !== undefined) {
    const funcKey = firstUnique.replace('unique:', '')
    switch (funcKey) {
      case 'prints':
        return allPrintings
      case 'art':
        return uniqueArts
      case 'cards':
        return findPrinting
      default:
        throw Error(`unknown print filter function ${funcKey}`)
    }
  }

  return findPrinting
}