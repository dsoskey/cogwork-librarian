import { QueryReport, useReporter } from '../useReporter'
import { createContext, useState } from 'react'
import { Card } from 'mtgql'
import { Setter, TaskStatus } from '../../types'
import { fetchCardCollection } from '../scryfall/collection'
import { parseEntry } from './types/cardEntry'
import { cogDB } from './db'

interface ListImporter {
  attemptImport: (rawCards: string[], restart: boolean) => Promise<Card[]>
  abandonImport: () => void
  result: Card[]
  missing: string[]
  setMissing: Setter<string[]>
  status: TaskStatus
  report: QueryReport
}

const defaultListImporter: ListImporter = {
  attemptImport: () => Promise.reject("ListImporter.attemptImport called without a provider!"),
  result: [],
  missing: [],
  abandonImport: () => console.error("ListImporter.abandonImport called without a provider!"),
  setMissing: () => console.error("ListImporter.setMissing called without a provider!"),
  status: 'unstarted',
  report: undefined,
}

export const ListImporterContext = createContext(defaultListImporter)

export function useListImporter(): ListImporter {
  const [status, setStatus] = useState<TaskStatus>('unstarted')
  const [result, setResult] = useState<Card[]>([])
  const [missing, setMissing] = useState<string[]>([])
  const report = useReporter()

  const attemptImport = async (rawCards: string[], restart: boolean = false) => {
    setStatus('loading')
    report.reset(rawCards.length)

    const { foundCards, cardsToQueryAPI } = await findCardsLocally(rawCards)
    console.debug(`searched local store. ${foundCards.length} found. to query:`, cardsToQueryAPI);

    let missingNames: string[] = [];
    if (Object.keys(cardsToQueryAPI).length > 0) {
      console.debug("querying scryfall for missing cards")

      const identifiers = Object.keys(cardsToQueryAPI).map(name => ({name}))
      const collection = await fetchCardCollection(identifiers);
      foundCards.push(...collection.data)
      missingNames = collection.not_found.map(it => it.name)
    }

    setResult(restart ? foundCards : (prev) => [...prev, ...foundCards])
    setMissing(missingNames.map(cardName => `${cardsToQueryAPI[cardName]} ${cardName}`))
    report.markTimepoint("end")

    if (missingNames.length > 0) {
      setStatus("error")
      throw Error('List import failed to find all cards.')
    }

    setStatus("success")
    return restart ? foundCards : [...result, ...foundCards]
  }

  const abandonImport = () => {
    setStatus("success")
  }

  return { attemptImport, abandonImport, result, missing, setMissing, status, report }
}

// consider moving this into CardIndex or CogDB
async function findCardsLocally(rawCards: string[]) {
  const foundCards: Card[] = []
  const cardsToQueryAPI: { [cardName: string]: number } = {}

  for (const rawCard of rawCards) {
    if (rawCard.trim().length === 0) continue;

    const parsedRow = parseEntry(rawCard)
    const { quantity, name, set, cn } = parsedRow;
    const maybeCard = await cogDB.getCardByName(name, set, cn);
    if (maybeCard !== undefined) {
      const upperLimit = quantity ?? 1;
      for (let i = 0; i < upperLimit; i++) {
        foundCards.push(maybeCard)
      }
    } else if (cardsToQueryAPI[name] === undefined) {
      cardsToQueryAPI[name] = quantity;
    } else {
      cardsToQueryAPI[name] += quantity;
    }
  }

  return { foundCards, cardsToQueryAPI }
}
