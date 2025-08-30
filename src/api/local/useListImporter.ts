import { QueryReport, useReporter } from '../useReporter'
import { createContext, useState } from 'react'
import { Card, normCardList, NormedCard } from 'mtgql'
import { Setter, TaskStatus } from '../../types'
import * as Scry from 'scryfall-sdk'
import { CogDB } from './useCogDB'
import { CARD_INDEX } from './cardIndex'

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
export const useListImporter = (cogDb: CogDB): ListImporter => {
  const [status, setStatus] = useState<TaskStatus>('unstarted')
  const [result, setResult] = useState<NormedCard[]>([])
  const [missing, setMissing] = useState<string[]>([])
  const report = useReporter()

  const run = async (rawCards: string[], restart: boolean = false) => {
    return new Promise<NormedCard[]>((resolve, reject) => {
      const foundCards: NormedCard[] = []
      const cardsToQueryAPI: { [cardName: string]: number } = {}
      const missingNames: string[] = []
      const onDone = () => {
        setResult(restart ? foundCards : (prev) => [...prev, ...foundCards])
        setMissing(missingNames.map(cardName => `${cardsToQueryAPI[cardName]} ${cardName}`))
        report.markTimepoint("end")

        if (missingNames.length > 0) {
          setStatus("error")
          reject()
        } else {
          setStatus("success")
          resolve(restart ? foundCards : [...result, ...foundCards])
        }
      }

      setStatus('loading')
      report.reset(rawCards.length)

      console.time("process raws")
      for (const rawCard of rawCards) {
        if (rawCard.length > 0) {
          const parsedRow = parseListRow(rawCard)
          const { quantity, cardName } = parsedRow;
          const maybeCard = CARD_INDEX.cardByName(cardName.toLowerCase())
          if (maybeCard !== undefined) {
            for (let i = 0; i < quantity; i++) {
              foundCards.push(maybeCard)
            }
            report.addComplete()
          } else if (cardsToQueryAPI[cardName] === undefined) {
            cardsToQueryAPI[cardName] = quantity;
          } else {
            cardsToQueryAPI[cardName] += quantity;
          }
        }
      }
      console.timeEnd("process raws")
      console.debug(`processed local. ${foundCards.length} found. ${cardsToQueryAPI.length} to query`)

      if (Object.keys(cardsToQueryAPI).length > 0) {
        console.debug("querying scryfall for missing cards")
        Scry.Cards.collection(...Object.keys(cardsToQueryAPI).map(name => ({name})))
          .on('data', data => {
            foundCards.push(normCardList([data as Card])[0])
            report.addComplete()
          })
          .on("not_found", data => {
            missingNames.push(data.name)
          })
          .on("done", onDone)
      } else {
        onDone()
      }
    })
  }

  const abandonImport = () => {
    setStatus("success")
  }

  return { attemptImport: run, abandonImport, result, missing, setMissing, status, report }
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