import React, { useContext } from 'react'
import { Setter } from '../../types'
import { NormedCard } from 'mtgql'
import { ListImporterContext } from '../../api/local/useListImporter'
import { ProjectContext } from '../../api/local/useProjectDao'

export interface CubeListImporterProps {
  cardsToImport: string[]
  setCardsToImport: Setter<string[]>
  setCards: Setter<NormedCard[]>
  setError: Setter<string>
  loader: React.ReactNode
  children: React.ReactNode
}
export const CubeListImporter = ({ setCards, setError, loader, children, setCardsToImport, cardsToImport }: CubeListImporterProps) => {
  const listImporter = useContext(ListImporterContext)
  const project = useContext(ProjectContext)
  const useSavedCards = () => {
    setCardsToImport(project.savedCards
      .map(it => it.cards.map(it => `${it.quantity} ${it.name}`)).flat())
  }
  const importList = () => {
    listImporter.attemptImport(cardsToImport, true)
      .then(setCards)
      .catch((error) => setError(error))
  }

  return <div className='list-import'>
    {children}
    {listImporter.status !== "error" && <>
      <textarea
        className='cards-to-import coglib-prism-theme'
        value={cardsToImport.join('\n')}
        placeholder='enter one exact card name per line'
        spellCheck={false}
        rows={9}
        disabled={listImporter.status === 'loading'}
        onChange={(event) => {
          setCardsToImport(event.target.value.split('\n'))
        }}
      />
      <div className='row'>
        <span>
          <button onClick={useSavedCards}>use saved cards</button>
          <button onClick={importList}>import list</button>
        </span>
        {loader}
      </div>
    </>}
  </div>
}