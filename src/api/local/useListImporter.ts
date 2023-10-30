import { QueryReport, useReporter } from '../useReporter'
import { createContext, useState } from 'react'
import { normCardList, NormedCard } from '../memory/types/normedCard'
import { Setter, TaskStatus } from '../../types'
import * as Scry from 'scryfall-sdk'
import { CogDB } from './useCogDB'

interface ListImporter {
  attemptImport: (rawCards: string[], restart: boolean) => Promise<NormedCard[]>
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
      const cardsToQueryAPI: string[] = []
      const missingNames: string[] = []
      const onDone = () => {
        setResult(restart ? foundCards : (prev) => [...prev, ...foundCards])
        setMissing(missingNames)
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
          const maybeCard = cogDb.cardByName(rawCard.toLowerCase())
          if (maybeCard !== undefined) {
            foundCards.push(maybeCard)
            report.addComplete()
          } else {
            cardsToQueryAPI.push(rawCard)
          }
        }
      }
      console.timeEnd("process raws")
      console.debug(`processed local. ${foundCards.length} found. ${cardsToQueryAPI.length} to query`)

      if (cardsToQueryAPI.length > 0) {
        console.debug("querying scryfall for missing cards")
        Scry.Cards.collection(...cardsToQueryAPI.map(name => ({name})))
          .on('data', data => {
            foundCards.push(normCardList([data])[0])
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

  return { attemptImport: run, result, missing, setMissing, status, report }
}