import { createContext, useState } from 'react'
import { Setter } from '../../types'
import { CubeDefinition, ExternalCubeSource } from '../mql/types/cube'

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
  attemptRefresh: (cubeIds: { [key: string]: CubeDefinition[] }) => void
  status: string
  isRunning: boolean
  missingCubes: string[]
  missingCards: MissingCards
  cubeIds: string[]
  setCubeIds: Setter<string[]>
  source: ExternalCubeSource
  setSource: Setter<ExternalCubeSource>
}

const defaultCubeImporter: BulkCubeImporter = {
  attemptImport: () => console.error("BulkCubeImporterContext.attemptImport without a producer!"),
  attemptRefresh: () => console.error("BulkCubeImporterContext.attemptRefresh without a producer!"),
  status: "importer dont work!",
  isRunning: false,
  missingCubes: [],
  missingCards: { cubeToCard: {}, count: 0 },
  cubeIds: [],
  setCubeIds: () => console.error("BulkCubeImporterContext.setCubeIds called without a producer!"),
  source: "cubecobra",
  setSource: () => console.error("BulkCubeImporterContext.setSource called without a producer!"),
}

export const BulkCubeImporterContext = createContext(defaultCubeImporter)
export const useBulkCubeImporter = (): BulkCubeImporter => {
  const [source, setSource] = useState<ExternalCubeSource>("cubeartisan")
  const timerName = `import from ${source}`
  const [cubeIds, setCubeIds] = useState<string[]>([]);
  const [status, setStatus] = useState<string>("scryfall-cards-missing");
  const isRunning = RUNNING_STATES.includes(status);
  const [missingCubes, setMissingCubes] = useState<[]>([]);
  const [missingCards, setMissingCards] = useState<MissingCards>({
    cubeToCard: {}, count: 0
  });
  const handleCubeImport = (event: MessageEvent): any => {
    const {type, data} = event.data
    switch (type) {
      case "error-missing-cubes":
        setStatus("error-missing-cubes")
        setMissingCubes(data)
        console.timeEnd(timerName)
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
        console.timeEnd(timerName)
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
    console.time(timerName)
    // @ts-ignore
    const worker = new Worker(new URL("./cubeImportWorker.ts", import.meta.url))
    setStatus("querying-cubecobra")
    setMissingCubes([])
    worker.onmessage = handleCubeImport
    worker.postMessage({ type: "import", data: { cubeIds: submittableCubeIds, source } })
  }

  const attemptRefresh = (cubesBySource: { [key: string]: CubeDefinition[] }) => {
    if (Object.keys(cubesBySource).length === 0) return;

    console.debug("starting cube import worker")
    // @ts-ignore
    const worker = new Worker(new URL("./cubeImportWorker.ts", import.meta.url))
    setStatus("querying-cubecobra")
    setMissingCubes([])
    worker.onmessage = handleCubeImport
    for (let [cubeSource, cubes] of Object.entries(cubesBySource)) {
      const submittableCubeIds = cubes.map(it => it.key)
      worker.postMessage({ type: "import", data: { cubeIds: submittableCubeIds, source: cubeSource } })
    }
  }

  return {
    attemptImport,
    attemptRefresh,
    status,
    isRunning,
    missingCubes,
    missingCards,
    cubeIds,
    setCubeIds,
    source,
    setSource,
  }
}