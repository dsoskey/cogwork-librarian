import { createContext, useState } from 'react'
import { Setter } from '../../types'

const RUNNING_STATES = [
  "querying-cubecobra",
  "finding-oracle-ids",
  "scryfall-lookup",
  "generating-cube-definitions",
  "saving-to-db",
  "refresh-memory",
]
export interface MissingCards {
  cubeToCard: { [cubeId: string]: string[] }
  count: number
}

interface BulkCubeImporter {
  attemptImport: (cubeIds: string[]) => void
  status: string
  isRunning: boolean
  missingCubes: string[]
  missingCards: MissingCards
  cubeIds: string[]
  setCubeIds: Setter<string[]>
}

const defaultCubeImporter: BulkCubeImporter = {
  attemptImport: () => console.error("BulkCubeImporterContext.attemptImport without a producer!"),
  status: "importer dont work!",
  isRunning: false,
  missingCubes: [],
  missingCards: { cubeToCard: {}, count: 0 },
  cubeIds: [],
  setCubeIds: () => console.error("BulkCubeImporterContext.setCubeIds called without a producer!"),
}

export const BulkCubeImporterContext = createContext(defaultCubeImporter)
export const useBulkCubeImporter = (): BulkCubeImporter => {
  const [cubeIds, setCubeIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("scryfall-cards-missing");
  const isRunning = RUNNING_STATES.includes(status);
  const [missingCubes, setMissingCubes] = useState<[]>([]);
  const [missingCards, setMissingCards] = useState<MissingCards>({
    cubeToCard: {}, count: 0
  });
  const handleCubeCobraImport = (event: MessageEvent): any => {
    const {type, data} = event.data
    switch (type) {
      case "error-missing-cubes":
        setStatus("error-missing-cubes")
        setMissingCubes(data)
        console.timeEnd("import from cubecobra")
        break;
      case "scryfall-cards-missing":
        setStatus("scryfall-cards-missing")
        setMissingCards(data)
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
      case "end":
        setStatus("")
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
    isRunning,
    missingCubes,
    missingCards,
    cubeIds,
    setCubeIds,
  }
}