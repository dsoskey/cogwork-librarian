import { Loader } from '../component/loader'
import React, { useContext, useRef } from 'react'
import { normCardList, NormedCard } from '../../api/local/normedCard'
import { Card } from 'scryfall-sdk'
import { Setter, TaskStatus } from '../../types'
import { CogDBContext } from '../../api/local/useCogDB'
import { ListImporterContext } from '../../api/local/useListImporter'
import { TextEditor } from '../component/textEditor'
import { Manifest } from '../../api/local/db'

const JSONMIME = "application/json"
const TEXTMIME = "text/plain"
export interface FileImporterProps {
  setDbDirty: Setter<boolean>
  dbImportStatus: TaskStatus
  setDbImportStatus: Setter<TaskStatus>
}
export const FileImporter = ({
  dbImportStatus,
  setDbImportStatus,
  setDbDirty,
}: FileImporterProps) => {
  const { manifest, setManifest, setMemory } = useContext(CogDBContext)
  const listImporter = useContext(ListImporterContext)
  const proposedManifest = useRef<Manifest>(manifest)
  const moveImportToMemory = () => {
    setMemory(listImporter.result)
    setManifest(proposedManifest.current)
    setDbDirty(true)
    setDbImportStatus("success")
  }

  const processFileText = async (file: File): Promise<void> => {
    proposedManifest.current = {
      id: 'file',
      name: file.name,
      type: 'file',
      lastUpdated: new Date(file.lastModified),
    }
    const content = await file.text()
    let cards: NormedCard[]
    switch (file.type) {
      case JSONMIME:
        cards = normCardList(JSON.parse(content).map(Card.construct))
        break
      case TEXTMIME:
        cards = await listImporter.attemptImport(content.split(/[\r\n]+/))
        break
      default:
        throw Error(`unrecognized file type ${file.type}`)
    }
    setMemory(cards)
    setManifest(proposedManifest.current)
    setDbDirty(true)
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
    listImporter.attemptImport(listImporter.missing)
      .then(() => {
        moveImportToMemory()
      })
      .catch((error) => {
        console.error(error)
        setDbImportStatus('error')
      })
  }

  return <div className='file-import'>
    <h3>import from a file</h3>
    {listImporter.status === "loading" && (
      <Loader
        label="cards found"
        width={200}
        count={listImporter.report.complete}
        total={listImporter.report.totalQueries}
      />
    )}
    {dbImportStatus === "error" && (<>
      <p>the importer failed to find some of your card names. make any edits you need before retrying card search</p>
      <TextEditor setQueries={listImporter.setMissing} queries={listImporter.missing} />
      <button onClick={moveImportToMemory}>import found cards</button>
      <button onClick={retrySearch}>retry search</button>
    </>)}
    {listImporter.status !== "loading" &&
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
            disabled={dbImportStatus === 'loading'}
            id='file-import'
            type='file'
            accept='.json,.txt'
            onChange={onFileInput}
          />
        </div>
      </>}
  </div>
}