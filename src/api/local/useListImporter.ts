import { QueryReport, useReporter } from '../useReporter'
import { createContext, useState } from 'react'
import { normCardList, NormedCard } from 'mtgql'
import { Setter, TaskStatus } from '../../types'
import { CARD_INDEX } from './cardIndex'
import { fetchCardCollection } from '../scryfall/collection'
import { parseEntry } from './types/cardEntry'

interface ListImporter {
  attemptImport: (rawCards: string[], restart: boolean) => Promise<NormedCard[]>
  abandonImport: () => void
  result: NormedCard[]
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
  const [result, setResult] = useState<NormedCard[]>([])
  const [missing, setMissing] = useState<string[]>([])
  const report = useReporter()

  const attemptImport = async (rawCards: string[], restart: boolean = false) => {
    setStatus('loading')
    report.reset(rawCards.length)

    console.time("process raws")
    const { foundCards, cardsToQueryAPI } = findCardsLocally(rawCards)
    console.timeEnd("process raws")
    console.debug(`processed local. ${foundCards.length} found. ${cardsToQueryAPI.length} to query`)

    let missingNames: string[] = [];
    if (Object.keys(cardsToQueryAPI).length > 0) {
      console.debug("querying scryfall for missing cards")

      const identifiers = Object.keys(cardsToQueryAPI).map(name => ({name}))
      const collection = await fetchCardCollection(identifiers);
      foundCards.push(...collection.data.map(it => normCardList([it])[0]))
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

interface ParsedRow {
  quantity: number;
  cardName: string;
}
function parseListRow(row: string): ParsedRow {
  const tokens = row.split(' ');

  if (/^\d+x?$/.test(tokens[0])) {
    return { quantity: parseInt(tokens[0]), cardName: tokens.slice(1).join(' ') }
  } else {
    return { quantity: 1, cardName: row }
  }
}

// consider moving this into CardIndex or CogDB
function findCardsLocally(rawCards: string[]) {
  const foundCards: NormedCard[] = []
  const cardsToQueryAPI: { [cardName: string]: number } = {}

  for (const rawCard of rawCards) {
    if (rawCard.trim().length === 0) continue;

    const parsedRow = parseEntry(rawCard)
    const { quantity, name } = parsedRow;
    const maybeCard = CARD_INDEX.cardByName(name.toLowerCase())
    if (maybeCard !== undefined) {
      for (let i = 0; i < quantity; i++) {
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
