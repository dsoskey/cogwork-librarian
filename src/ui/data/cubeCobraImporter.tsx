import React, { useContext } from 'react'
import { BulkCubeImporterContext } from '../../api/cubecobra/useBulkCubeImporter'
import "./cubeCobraImporter.css"

export const CUBE_IMPORT_MESSAGES = {
  "querying-cubecobra": "downloading cube lists...",
  "finding-oracle-ids": "finding associated cards...",
  "generating-cube-definitions": "generating cube definitions...",
  "saving-to-db": "propagating cube definitions to the database...",
  "refresh-memory": "reloading memory...",
}

const RUNNING_STATES = [
  "querying-cubecobra",
  "finding-oracle-ids",
  "scryfall-lookup",
  "generating-cube-definitions",
  "saving-to-db",
  "refresh-memory",
]
export const BulkCubeCobraImporter = () => {
  const {
    cubeIds, setCubeIds,
    attemptImport, missingCubes, status
  } = useContext(BulkCubeImporterContext)
  const isRunning = RUNNING_STATES.includes(status)

  return <div className='cubecobra-import'>
    <textarea
      className='cards-to-import coglib-prism-theme'
      placeholder='enter one cube id per line'
      value={cubeIds.join("\n")}
      rows={9}
      onChange={(event) => setCubeIds(event.target.value.split("\n"))}
    />
    <div className='row'>
      <button onClick={() => attemptImport(cubeIds)} disabled={isRunning}>import cubes</button>
      {CUBE_IMPORT_MESSAGES[status]?.length > 0 && <div>{CUBE_IMPORT_MESSAGES[status]}</div>}
      {missingCubes.length > 0 && <span className='alert'>
        couldn't find cubes: {missingCubes.join(", ")}
      </span>}
    </div>
  </div>
}