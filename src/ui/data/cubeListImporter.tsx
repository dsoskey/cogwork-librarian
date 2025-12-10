import React, { useContext } from 'react'
import { Setter } from '../../types'
import { ListImporterContext } from '../../api/local/useListImporter'
import { ProjectContext } from '../../api/local/useProjectDao'
import { ARENA_FORMAT_PLACEHOLDER } from '../../strings'
import { TextEditor } from '../component/editor/textEditor'

export interface CubeListImporterProps {
  cardsToImport: string[]
  setCardsToImport: Setter<string[]>
  loader: React.ReactNode
  children: React.ReactNode
  importList: () => void;
}
export const CubeListImporter = ({ importList, loader, children, setCardsToImport, cardsToImport }: CubeListImporterProps) => {
  const listImporter = useContext(ListImporterContext)
  const project = useContext(ProjectContext)
  const useSavedCards = () => {
    setCardsToImport(project.savedCards.map(it => it.cards).flat())
  }

  return <div className='list-import'>
    {children}
    {listImporter.status !== "error" && <>
      <TextEditor
        className='cards-to-import'
        language="arena-list"
        queries={cardsToImport}
        gutterColumns={[]}
        placeholder={ARENA_FORMAT_PLACEHOLDER}
        disabled={listImporter.status === 'loading'}
        setQueries={setCardsToImport}
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