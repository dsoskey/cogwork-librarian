import React, { useContext } from 'react'
import { importCube } from '../../api/cubecobra/cubeListImport'
import { Setter } from '../../types'
import { ListImporterContext } from '../../api/local/useListImporter'
import { NormedCard } from '../../api/memory/types/normedCard'
import "./cubeCobraImporter.css"

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

  return <div className='cubecobra-import row'>
    {children}
    <button
      disabled={showConfirmation || cubeId.trim().length === 0 || listImporter.status === 'loading'}
      onClick={attemptCubeCobraImport}>
      import
    </button>
    {loader}
  </div>
}