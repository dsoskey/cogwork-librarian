import React, { useContext, useRef, useState } from 'react'
import { ListImporterContext } from '../../api/local/useListImporter'
import { CogDBContext } from '../../api/local/useCogDB'
import { Setter, TaskStatus } from '../../types'
import { Manifest, MANIFEST_ID } from '../../api/local/db'
import { Loader } from '../component/loader'
import { ProjectContext } from '../../api/useProject'
import { NormedCard } from '../../api/memory/types/normedCard'
import { ImportTarget } from './cardDataView'

export interface CardListImporterProps {
  importTargets: ImportTarget[]
  dbImportStatus: TaskStatus
  setDbImportStatus: Setter<TaskStatus>
}

export const CardListImporter = ({
  importTargets,
  dbImportStatus,
  setDbImportStatus,
}: CardListImporterProps) => {
  const { manifest, setManifest, setMemory, saveToDB } = useContext(CogDBContext)
  const listImporter = useContext(ListImporterContext)
  const project = useContext(ProjectContext)
  const [listTitle, setListTitle] = useState<string>("custom text import")
  const [cardsToImport, setCardsToImport] = useState<string[]>([])
  const proposedManifest = useRef<Manifest>(manifest)

  const finish = async (res: NormedCard[]) => {
    if (importTargets.find(it => it === "memory")) {
      setManifest(proposedManifest.current)
      setMemory(res)
    }
    if (importTargets.find(it => it === "db")) {
      await saveToDB(proposedManifest.current, res)
    }
    setCardsToImport([])
    setDbImportStatus("success")
  }

  const useSavedCards = () => {
    setCardsToImport(project.savedCards)
  }

  const doTry = (target: string[], restart: boolean) => {
    listImporter.attemptImport(target, restart)
      .then(finish)
      .catch((error) => {
        console.error(error)
        setDbImportStatus('error')
      })
  }

  const importList = () => {
    setDbImportStatus('loading')
    const lastUpdated = new Date()
    proposedManifest.current = {
      id: MANIFEST_ID,
      name: listTitle.length > 0 ? listTitle : "text import",
      type: 'text',
      lastUpdated,
    }
    doTry(cardsToImport, true)
  }

  const retrySearch = () => {
    doTry(listImporter.missing, false)
  }

  return <div className="list-import">
    {listImporter.status === "loading" && (
      <Loader
        label="cards found"
        width={200}
        count={listImporter.report.complete}
        total={listImporter.report.totalQueries}
      />
    )}
    {dbImportStatus === "error" && (<>
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
        <button onClick={() => finish(listImporter.result)}>import found cards</button>
      </div>

    </>)}
    {dbImportStatus !== "loading" && dbImportStatus !== "error" && <>
      <label className='row'>
        <strong>data set name:</strong>
        <input value={listTitle} onChange={event => setListTitle(event.target.value)} />
      </label>
      <textarea
        className='cards-to-import coglib-prism-theme'
        value={cardsToImport.join('\n')}
        placeholder='enter one exact card name per line'
        spellCheck={false}
        rows={9}
        onChange={(event) => {
          setCardsToImport(event.target.value.split('\n'))
        }}
      />
      <div><button onClick={useSavedCards}>use saved cards</button>
        <button onClick={importList}>import list</button></div>

    </>}
  </div>
}
