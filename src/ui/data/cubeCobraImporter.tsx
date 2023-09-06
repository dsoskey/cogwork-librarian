import React, { useContext, useState } from 'react'
import { importCube } from '../../api/cubecobra/cubeListImport'
import { Setter } from '../../types'
import { ListImporterContext } from '../../api/local/useListImporter'
import { NormedCard } from '../../api/memory/types/normedCard'
import "./cubeCobraImporter.css"
import { isOracleVal } from '../../api/memory/filters/is'
import { CubeDefinition } from '../../api/memory/types/cube'
import { cogDB } from '../../api/local/db'
import { CogDBContext } from '../../api/local/useCogDB'

export const CUBE_IMPORT_MESSAGES = {
  "querying-cubecobra": "downloading cube lists...",
  "finding-oracle-ids": "finding associated cards...",
  "generating-cube-definitions": "generating cube definitions...",
  "saving-to-db": "propagating cube definitions to the database...",
  "refresh-memory": "reloading memory...",
}
export interface CubeCobraImporterProps {
  cubeId: string
  showConfirmation: boolean
  setError: Setter<string>
  setCards: Setter<NormedCard[]>
  loader: React.ReactNode
  children: React.ReactNode
}
export const CubeCobraImporter = ({ cubeId, setError, setCards, children, loader, showConfirmation }: CubeCobraImporterProps) => {
  const listImporter = useContext(ListImporterContext)

  const attemptCubeCobraImport = () => {
    const key = cubeId.trim()
    if (key.length === 0) {
      setError("cube id must not be blank")
    } else {
      importCube(cubeId)
        .then(cardNames => listImporter.attemptImport(cardNames, true))
        .then(setCards)
        .catch(e => setError(e.toString()))
    }
  }

  return <div className='cubecobra-import column'>
    <div className='row'>
      {children}
      <button
        disabled={showConfirmation || cubeId.trim().length === 0 || listImporter.status === 'loading'}
        onClick={attemptCubeCobraImport}>
        import
      </button>
    </div>
    {loader}
  </div>
}

const generateNameToOracleId = (cards: NormedCard[]): { [name:string]: string } => {
  const result = {}
  for (const card of cards) {
    if (!isOracleVal("extra")(card)) {
      result[card.name] = card.oracle_id
      result[card.name.toLowerCase()] = card.oracle_id
      if (card.name.includes(" // ")) {
        result[card.name.split(" // ")[0]] = card.oracle_id
        result[card.name.split(" // ")[0].toLowerCase()] = card.oracle_id
      }
    }
  }
  return result
}

export const BulkCubeCobraImporter = () => {
  const listImporter = useContext(ListImporterContext)
  const _cogDb = useContext(CogDBContext)

  const [cubeIds, setCubeIds] = useState<string[]>([])
  const [status, setStatus] = useState<string>("unstarted")
  const [foundCubes, setFoundCubes] = useState<{ [cubeId: string]: string[]}>({})

  const attemptCardImport = async (cubesToImport: { [cubeId: string]: string[] }) => {
    const cardNames = Array.from(new Set(Object.values(cubesToImport).flat()))
    setStatus("finding-oracle-ids")
    console.time("finding-oracle-ids")
    const importedCards = await listImporter.attemptImport(cardNames, true)
    const nameToOracleId = generateNameToOracleId(importedCards)
    const last_updated = new Date()
    console.timeEnd("finding-oracle-ids")
    setStatus("generating-cube-definitions")
    console.time("generating-cube-definitions")
    const cubeDefinitions: CubeDefinition[] = Object.entries(cubesToImport)
      .map(([key, names]) => ({
        key,
        oracle_ids: names.map(it => nameToOracleId[it]).filter(it => it !== undefined),
        source: "cubecobra",
        last_updated,
      }))
    console.timeEnd("generating-cube-definitions")
    setStatus("saving-to-db")
    console.time("saving-to-db")
    await cogDB.bulkUpsertCube(cubeDefinitions)
    console.timeEnd("saving-to-db")
    setStatus("refresh-memory")
    await _cogDb.resetDB()
    setStatus("")
  }
  const attemptCubeCobraImport = () => new Promise((resolve, reject) => {
    const submittableCubeIds = Array.from(new Set(cubeIds
      .map(it => it.trim())
      .filter(it => it.length > 0)))

    if (submittableCubeIds.length === 0) {
      console.error("no cube ids detected")
      return
    }
    setStatus("querying-cubecobra")

    Promise.allSettled(submittableCubeIds.map(importCube))
      .then(results => {
        const toFoundCubes: { [cubeId: string]: string[] } = {}
        const missingCubes: string[] = []
        for (let i = 0; i < results.length; i++) {
          const cubeId = submittableCubeIds[i]
          const result = results[i]

          if (result.status === "fulfilled") {
            toFoundCubes[cubeId] = result.value
          } else {
            missingCubes.push(cubeId)
          }
        }
        setFoundCubes(toFoundCubes)
        if (missingCubes.length > 0) {
          setStatus("cubes-not-found")
          setCubeIds(missingCubes)
          reject()
        }
        return toFoundCubes
      })
      .then(attemptCardImport)
      .then(resolve)
      .catch((e) => {
        console.error(e)
        setStatus(e.toString())
        reject()
      })
  })

  return <div className='cubecobra-import'>
    {CUBE_IMPORT_MESSAGES[status]}
    <textarea className='cards-to-import coglib-prism-theme'
      placeholder='enter one cube id per line'
      value={cubeIds.join("\n")}
      onChange={(event) => setCubeIds(event.target.value.split("\n"))} />
    <div><button onClick={attemptCubeCobraImport}>import cubes</button></div>
  </div>
}