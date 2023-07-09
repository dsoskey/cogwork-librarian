import { QueryReport, useReporter } from '../useReporter'
import { createContext, useRef, useState } from 'react'
import { normCardList, NormedCard } from '../memory/types/normedCard'
import { Setter, TaskStatus } from '../../types'
import isEqual from 'lodash/isEqual'
import * as Scry from 'scryfall-sdk'
import { filters } from '../memory/filters'
import { cogDB } from './db'
import { invertCubes } from '../memory/types/cube'
import { invertTags } from '../memory/types/tag'

interface ListImporterProps {
  memory: NormedCard[]
}
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
export const useListImporter = ({ memory }: ListImporterProps): ListImporter => {
  const [status, setStatus] = useState<TaskStatus>('unstarted')
  const [result, setResult] = useState<NormedCard[]>([])
  const [missing, setMissing] = useState<string[]>([])
  const report = useReporter()

  const rawData = useRef<{ [name: string]: NormedCard }>({})

  const run = async (rawCards: string[], restart: boolean = false) => {
    const cubes = await cogDB.cube.toArray()
    const cardIdToCubes = invertCubes(cubes)
    const tags = await cogDB.oracleTag.toArray()
    const cardIdToOracleTags = invertTags(tags)

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

      if (isEqual(rawData.current, {})) {
        // Idea: store cards in memory like this
        const isToken = filters.textMatch("type_line", "Token")
        for (const cardInMemory of memory) {
          if (!isToken(cardInMemory)) {
            rawData.current[cardInMemory.name.toLowerCase()] = cardInMemory
          }
        }
      }

      console.log("process raws")
      rawCards.filter(it => it.length > 0).forEach(rawCard => {
        const maybeCard = rawData.current[rawCard.toLowerCase()]
        if (maybeCard !== undefined) {
          foundCards.push(maybeCard)
          report.addComplete()
        } else {
          cardsToQueryAPI.push(rawCard)
        }
      })
      console.log(`processed local. ${foundCards.length} found. ${cardsToQueryAPI.length} to query`)

      if (cardsToQueryAPI.length > 0) {
        console.log("calling them")
        Scry.Cards.collection(...cardsToQueryAPI.map(name => ({name})))
          .on('data', data => {
            foundCards.push(normCardList([data], cardIdToCubes, cardIdToOracleTags)[0])
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