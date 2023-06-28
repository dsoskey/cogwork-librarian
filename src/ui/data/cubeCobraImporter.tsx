import React, { useContext } from 'react'
import { importCube } from '../../api/cubecobra/cubeListImport'
import { Setter } from '../../types'
import { ListImporterContext } from '../../api/local/useListImporter'
import { Loader } from '../component/loader'
import { NormedCard } from '../../api/memory/types/normedCard'

export interface CubeCobraImporterProps {
  cubeId: string
  setError: Setter<string>
  setCards: Setter<NormedCard[]>
}
export const CubeCobraImporter = ({ cubeId, setError, setCards }: CubeCobraImporterProps) => {
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

  const retrySearch = () => {
    listImporter.attemptImport(listImporter.missing, false)
      .then(setCards)
      .catch(e => setError(e.toString()))
  }

  return <div className='cubecobra-import'>
    {listImporter.status === "loading" && (
      <Loader
        label="cards found"
        width={200}
        count={listImporter.report.complete}
        total={listImporter.report.totalQueries}
      />
    )}
    {listImporter.status === "error" && <>
      <p>the importer failed to find {listImporter.missing.length} card name{listImporter.missing.length === 1 ? "":"s"}. make any edits you need before retrying card search, or import the {listImporter.result.length} found card{listImporter.result.length === 1 ? "": "s"} as is</p>
      <textarea
        className='cards-to-import coglib-prism-theme'
        value={listImporter.missing.join('\n')}
        spellCheck={false}
        rows={9}
        onChange={(event) => {
          listImporter.setMissing(event.target.value.split('\n'))
        }}
      />
      <div>
        <button onClick={retrySearch}>retry search</button>
        <button onClick={() => setCards(listImporter.result)}>import found cards</button>
      </div>

    </>}
    <button
      disabled={cubeId.trim().length === 0 || listImporter.status === 'loading'}
      onClick={attemptCubeCobraImport}>
      import {cubeId}
    </button>
  </div>
}