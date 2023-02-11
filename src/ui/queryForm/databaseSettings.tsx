import React, { useEffect } from 'react'
import { useState } from 'react'
import { Modal } from '../component/modal'
import { Setter, TaskStatus } from '../../types'
import { Card } from 'scryfall-sdk'
import { Manifest, toManifest } from '../../api/local/db'
import { normCardList, NormedCard } from '../../api/local/normedCard'
import { BulkDataDefinition } from 'scryfall-sdk/out/api/BulkData'
import * as Scry from 'scryfall-sdk'
import { downloadCards } from '../../api/local/populate'
import { humanFileSize } from '../humanFileSize'

export interface DatabaseSettingsProps {
  dbStatus: TaskStatus
  saveToDB: () => Promise<void>
  setMemory: Setter<NormedCard[]>
  manifest: Manifest | undefined
  setManifest: Setter<Manifest>
}
export const DatabaseSettings = ({
  dbStatus,
  saveToDB,
  setMemory,
  manifest,
  setManifest,
}: DatabaseSettingsProps) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [dbDirty, setDbDirty] = useState<boolean>(false)
  const [importStatus, setImportStatus] = useState<TaskStatus>('unstarted')

  const [targetDefinition, setTargetDefinition] = useState<
    BulkDataDefinition | undefined
  >()
  const [bulkDataDefinitions, setBulkDataDefinitions] = useState<
    BulkDataDefinition[]
  >([])
  useEffect(() => {
    Scry.BulkData.definitions().then((definitions) =>
      setBulkDataDefinitions(definitions.filter((it) => it.type !== 'rulings'))
    )
  }, [])

  return (
    <>
      <button className='db-settings' onClick={() => setModalOpen(true)}>
        settings
      </button>
      <Modal
        open={modalOpen}
        title={<h2>database settings</h2>}
        onClose={() => setModalOpen(false)}
      >
        <div>
          <div>
            <h3>in memory {importStatus === 'loading' && '(importing...)'}</h3>
            <div>
              <strong>source:</strong> <code>{manifest.name}</code>
            </div>
            <div>
              <strong>type:</strong> <code>{manifest.type}</code>
            </div>
            <div>
              <strong>last updated:</strong>{' '}
              <code>{manifest.lastUpdated.toString()}</code>
            </div>
            {dbDirty && (
              <div className='dirty-db-message'>
                in-memory data set hasn't been saved to database yet
              </div>
            )}
            <button
              disabled={dbStatus === 'loading' || !dbDirty}
              onClick={() => {
                saveToDB().then(() => setDbDirty(false))
              }}
            >
              {dbStatus !== 'loading' && !dbDirty
                ? 'database in sync'
                : `sav${
                    dbStatus === 'loading' ? 'ing' : 'e'
                  } to local database`}
            </button>
            {/*TODO<button>export to file</button>*/}
          </div>

          <div className='row db-import'>
            <div className='scryfall-import'>
              <h3>import from scryfall</h3>
              {bulkDataDefinitions.map((it) => (
                <div key={it.uri} className='scryfall-option'>
                  <input
                    id={`source-${it.type}`}
                    type='radio'
                    value={it.type}
                    checked={it.type === targetDefinition?.type}
                    onChange={() => setTargetDefinition(it)}
                  />
                  <label htmlFor={`source-${it.type}`}>{it.name}</label>
                  <code className='size'>{humanFileSize(it.size)}</code>
                  <div>{it.description}</div>
                </div>
              ))}
              <button
                disabled={
                  importStatus === 'loading' || targetDefinition === undefined
                }
                onClick={async () => {
                  if (targetDefinition) {
                    console.log(targetDefinition)
                    setImportStatus('loading')
                    const cards = await downloadCards(targetDefinition)
                    setMemory(cards)
                    setManifest(toManifest(targetDefinition))
                    setDbDirty(true)
                    setImportStatus('success')
                  }
                }}
              >
                import data
              </button>
            </div>

            <div className='file-import'>
              <h3>import from file</h3>
              <div className='file'>
                <label htmlFor='file-import'>
                  <div>
                    <p>click to browse files</p>

                    <p>or</p>

                    <p>drag a file here to import</p>
                  </div>
                </label>
                <input
                  disabled={importStatus === 'loading'}
                  id='file-import'
                  type='file'
                  accept='.json'
                  onChange={(event) => {
                    const file = event.target.files[0]
                    setImportStatus('loading')
                    file
                      .text()
                      .then((content) => {
                        const cards: Card[] = JSON.parse(content).map(
                          Card.construct
                        )
                        setMemory(normCardList(cards))
                        setManifest({
                          id: 'file',
                          name: file.name,
                          type: 'file',
                          lastUpdated: new Date(file.lastModified),
                        })
                        setDbDirty(true)
                        setImportStatus('success')
                      })
                      .catch((error) => setImportStatus('error'))
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
