import { Filter, FilterNode, not } from './base'
import { Card } from 'scryfall-sdk'
import { NormedCard, Printing } from '../types/normedCard'

export const printNode = (
  filtersUsed: string[],
  printFilter: Filter<Printing>,
): FilterNode => {
  return {
    filtersUsed,
    filterFunc: (it) => it.printings.find(printFilter) !== undefined,
    inverseFunc: (it) => it.printings.find(not(printFilter)) !== undefined,
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
  (filterFunc: Filter<Printing>) =>
    ({ printings, ...rest }: NormedCard): Card | undefined => {
      const maybePrint = printings.find(filterFunc)
      if (maybePrint !== undefined) {
        return Card.construct(<Card>{
          ...rest,
          ...maybePrint,
        })
      }
      return undefined
    }

export const allPrintings =
  (filterFunc: Filter<Printing>) =>
    ({ printings, ...rest }: NormedCard): Card[] => {
      return printings.filter(filterFunc).map((it) =>
        Card.construct(<Card>{
          ...rest,
          ...it,
        })
      )
    }

export const uniqueArts =
  (filterFunc: Filter<Printing>) =>
    ({ printings, ...rest }: NormedCard): Card[] => {
      const filteredPrints = printings.filter(filterFunc)
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

  return filtersUsed
    .filter((it) => showAllFilter.has(it)).length
    ? allPrintings
    : findPrinting
}