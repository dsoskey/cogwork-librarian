import { Loader } from '../component/loader'
import React, { useContext, useRef } from 'react'
import { normCardList, NormedCard } from '../../api/memory/types/normedCard'
import { Card } from 'scryfall-sdk'
import { Setter, TaskStatus } from '../../types'
import { CogDBContext } from '../../api/local/useCogDB'
import { ListImporterContext } from '../../api/local/useListImporter'
import { Manifest, MANIFEST_ID } from '../../api/local/db'
import { ImportTarget } from './cardDataView'

const JSONMIME = "application/json"
const TEXTMIME = "text/plain"

export interface CardFileImporterProps {
  importTargets: ImportTarget[]
  dbImportStatus: TaskStatus
  setDbImportStatus: Setter<TaskStatus>
}

export const CardFileImporter = ({
  importTargets,
  dbImportStatus,
  setDbImportStatus,
}: CardFileImporterProps) => {
  const { manifest, setManifest, setMemory, saveToDB } = useContext(CogDBContext)
  const listImporter = useContext(ListImporterContext)
  const proposedManifest = useRef<Manifest>(manifest)
  const moveImportToMemory = () => {
    if (importTargets.find(it => it === "memory")) {
      setManifest(proposedManifest.current)
      setMemory(listImporter.result)
    }
    if (importTargets.find(it => it === "db")) {
      saveToDB(proposedManifest.current, listImporter.result).then(() => {
        setDbImportStatus("success")
      }).catch(() => {
        setDbImportStatus("error")
      })
    } else {
      setDbImportStatus("success")
    }
  }

  const processFileText = async (file: File): Promise<void> => {
    proposedManifest.current = {
      id: MANIFEST_ID,
      name: file.name,
      type: 'file',
      lastUpdated: new Date(),
    }
    const content = await file.text()
    let cards: NormedCard[]
    switch (file.type) {
      case JSONMIME:
        cards = normCardList(JSON.parse(content).map(Card.construct))
        break
      case TEXTMIME:
        cards = await listImporter.attemptImport(content.split(/[\r\n]+/), true)
        break
      default:
        throw Error(`unrecognized file type ${file.type}`)
    }

    if (importTargets.find(it => it === "memory")) {
      setManifest(proposedManifest.current)
      setMemory(cards)
    }
    if (importTargets.find(it => it === "db")) {
      await saveToDB(proposedManifest.current, cards)
    }
  }
  const onFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDbImportStatus('loading')
    processFileText(event.target.files[0])
      .then(() => setDbImportStatus('success'))
      .catch((error) => {
        console.error(error)
        setDbImportStatus('error')
      })
  }

  const retrySearch = () => {
    listImporter.attemptImport(listImporter.missing, false)
      .then(() => {
        moveImportToMemory()
      })
      .catch((error) => {
        console.error(error)
        setDbImportStatus('error')
      })
  }

  return <div className='file-import'>
    {listImporter.status === "loading" && (
      <Loader
        label="cards found"
        width={400}
        count={listImporter.report.complete}
        total={listImporter.report.totalQueries}
      />
    )}
    {dbImportStatus === "error" && (<>
      {/* todo: extract to common component? */}
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
        <button onClick={moveImportToMemory}>import found cards</button>
      </div>
    </>)}
    {dbImportStatus !== "loading" && dbImportStatus !== "error" &&
      <>
        <p>valid formats are a json list of scryfall cards or a text list of exact card names</p>
        <div className='file'>
          <label htmlFor='file-import'>
            <div>
              <p>click to browse files</p>

              <p>or</p>

              <p>drag a file here to import</p>
            </div>
          </label>
          <input
            id='file-import'
            type='file'
            accept='.json,.txt'
            onChange={onFileInput}
          />
        </div>
      </>}
  </div>
}