import { createContext, useState } from 'react'
import { CogDB } from '../local/useCogDB'
import { Setter } from '../../types'

interface BulkCubeImporter {
  attemptImport: (cubeIds: string[]) => void
  status: string
  missingCubes: string[]
  cubeIds: string[]
  setCubeIds: Setter<string[]>
}

const defaultCubeImporter: BulkCubeImporter = {
  attemptImport: () => console.error("BulkCubeImporterContext.attemptImport without a producer!"),
  status: "importer dont work!",
  missingCubes: [],
  cubeIds: [],
  setCubeIds: () => console.error("BulkCubeImporterContext.setCubeIds called without a producer!"),
}

export const BulkCubeImporterContext = createContext(defaultCubeImporter)
export const useBulkCubeImporter = (cogDB: CogDB): BulkCubeImporter => {
  const [cubeIds, setCubeIds] = useState<string[]>([])
  const [status, setStatus] = useState<string>("unstarted")

  const [missingCubes, setMissingCubes] = useState<string[]>([])

  const handleCubeCobraImport = (event: MessageEvent): any => {
    const {type, data} = event.data
    switch (type) {
      case "error-missing-cubes":
        setStatus("error-missing-cubes")
        setMissingCubes(data)
        console.timeEnd("import from cubecobra")
        break;
      case "card-lookup":
        setStatus("finding-oracle-ids")
        break;
      case "scryfall-lookup":
        console.log(data)
        break;
      case "generate-cube-definitions":
        setStatus("generating-cube-definitions")
        break;
      case "save-to-db":
        setStatus("saving-to-db")
        break;
      case "refresh-memory":
        setStatus("refresh-memory")
        cogDB.resetDB().then(() => setStatus(""))
        console.timeEnd("import from cubecobra")
        break;
      default:
        console.log(event.data)
    }
  }
  const attemptImport = (cubeIds: string[]) => {
    const submittableCubeIds = Array.from(new Set(cubeIds
      .map(it => it.trim())
      .filter(it => it.length > 0)))

    if (submittableCubeIds.length === 0) {
      console.error("no cube ids detected")
      return
    }

    console.debug("starting cube import worker")
    console.time("import from cubecobra")
    // @ts-ignore
    const worker = new Worker(new URL("./cubeImportWorker.ts", import.meta.url))
    setStatus("querying-cubecobra")
    setMissingCubes([])
    worker.onmessage = handleCubeCobraImport
    worker.postMessage({ type: "import", data: submittableCubeIds })
  }

  return {
    attemptImport,
    status,
    missingCubes,
    cubeIds,
    setCubeIds,
  }
}