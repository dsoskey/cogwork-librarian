import React, { useContext } from 'react'
import { BulkCubeImporterContext } from '../../api/cubecobra/useBulkCubeImporter'
import { LoaderText } from '../component/loaders'
import { Alert } from '../component/alert/alert'

const REPORT_URL_BASE = "https://github.com/dsoskey/cogwork-librarian/issues/new?assignees=&labels=bug&projects=&title=failed+cubecobra+import&body=during+bulk+import+these+cards+were+not+found%0A```%0A"

const SP = "%20"
const NL = "%0A"
const encodeObject = (obj: {[u:string]:string[]}) => Object.entries(obj)
  .map(([k, v]) => {
    const cubeId = k.replace(/ /g, SP)
    const cards = v.map(it => `${SP}${SP}${it.replace(/ /g, SP)}`).join(NL)
    return`${cubeId}${NL}${cards}`
  }).join(NL)
export const CUBE_IMPORT_MESSAGES = {
  "querying-cubesite": "downloading cube lists",
  "finding-oracle-ids": "finding associated cards",
  "scryfall-lookup": "querying Scryfall for cards not in the database",
  "generating-cube-definitions": "generating cube definitions",
  "saving-to-db": "propagating cube definitions to the database",
  "refresh-memory": "reloading memory",
}

export const BulkImportMessage = () => {
  const { missingCards, missingCubes, status } = useContext(BulkCubeImporterContext)
  return <div className='row'>
    {CUBE_IMPORT_MESSAGES[status]?.length > 0 && <div><LoaderText text={CUBE_IMPORT_MESSAGES[status]} /></div>}
    {missingCubes.length > 0 && <Alert>couldn't find cubes: {missingCubes.join(", ")}</Alert>}
    {status === "scryfall-cards-missing" && missingCards.count > 0 && <Alert>
        could not find {missingCards.count} cards. this should never happen, so please{" "}
      <a href={`${REPORT_URL_BASE}${encodeObject(missingCards.cubeToCard)}${NL}\`\`\``}
         target="_blank"
         rel="noreferrer"
      >report this bug</a>
      </Alert>}
  </div>
}
export const BulkCubeSiteImporter = () => {
  const { cubeIds, setCubeIds, attemptImport, isRunning } = useContext(BulkCubeImporterContext)

  return <div className='cubesite-import'>
    <textarea
      className='cards-to-import coglib-prism-theme'
      placeholder='enter one cube id per line'
      value={cubeIds.join("\n")}
      rows={cubeIds.length > 0 ? cubeIds.length : 1}
      onChange={(event) => setCubeIds(event.target.value.split("\n"))}
    />
    <div className='row'>
      <button onClick={() => attemptImport(cubeIds)} disabled={isRunning}>import cubes</button>
    </div>
    <BulkImportMessage />
  </div>
}