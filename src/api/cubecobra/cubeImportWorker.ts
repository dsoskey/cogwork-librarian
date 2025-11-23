import { importCubeCobra } from './cubeListImport'
import { ExternalCubeSource } from 'mtgql'
import { cogDB } from '../local/db'

self.onmessage = (_event) => {
  const event = _event.data
  if (event.type === "import") {
    searchCubes(event.data).catch(e => postMessage({ type: 'error', data: e.toString() }))
  }
}

interface SearchInput {
  cubeIds: string[]
  source: ExternalCubeSource
}

async function searchCubes({ cubeIds, source }: SearchInput) {
  switch (source) {
    case 'cubecobra':
      await searchCubeCobra(cubeIds)
      break;
    default:
      throw Error(`Unknown cube source ${source}`)
  }
}

async function searchCubeCobra(cubeIds: string[]) {
  const last_updated = new Date()
  const missingCubes: string[] = []
  const results = await Promise
    .allSettled(cubeIds.map(it => importCubeCobra(it, last_updated)))

  for (let i = 0; i < results.length; i++) {
    const cubeId = cubeIds[i]
    const result = results[i]
    if (result.status === "rejected") {
      missingCubes.push(cubeId)
    }
  }

  if (missingCubes.length) {
    postMessage({ type: "error-missing-cubes", data: missingCubes })
    return
  }

  postMessage({ type: "generate-cube-definitions" })

  postMessage({ type: "save-to-db" })

  await cogDB.cube.bulkPut(results.filter(it => it.status === "fulfilled").map(it => it.value))

  postMessage({ type: "end" })
}