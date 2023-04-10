import React, { useContext } from 'react'
import { useState } from 'react'
import { Modal } from '../component/modal'
import { TaskStatus } from '../../types'
import { FileImporter } from './fileImporter'
import { ScryfallImporter } from './scryfallImporter'
import { CogDBContext } from '../../api/local/useCogDB'

const LAST_UPDATE = new Date('2023-03-10')

export interface DatabaseSettingsProps {}
export const DatabaseSettings = ({}: DatabaseSettingsProps) => {
  const { dbStatus, saveToDB, manifest } = useContext(CogDBContext)
  const [modalOpen, setModalOpen] = useState<boolean>(false)
  const [dbDirty, setDbDirty] = useState<boolean>(false)
  const [dbImportStatus, setDbImportStatus] = useState<TaskStatus>('unstarted')
  const outOfDate = manifest.lastUpdated < LAST_UPDATE

  const onModalClose = () => setModalOpen(false)
  const saveMemoryToDB = () => {
    saveToDB().then(() => setDbDirty(false))
  }
  return (
    <div>
      <div className='row'>
        <button className='db-settings' onClick={() => setModalOpen(true)}>
          settings
        </button>
        {outOfDate && <span className='alert'>DATABASE UPDATE REQUIRED</span>}
      </div>
      <Modal
        open={modalOpen}
        title={<h2>database settings</h2>}
        onClose={onModalClose}
      >
        <div>
          <div>
            <h3>in memory {dbImportStatus === 'loading' && '(importing...)'}</h3>
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
            {outOfDate && (
              <div className='alert'>
                cogwork librarian's syntax has updated since you last synced
                your database, so new queries may not function. to fix the
                issue, re-import your data file the same way you did last time
                and save to local database. if you've never imported a data set,
                choose "Default Cards" from import from scryfall below.
              </div>
            )}
            {dbDirty && (
              <div className='alert'>
                in-memory data set hasn't been saved to database yet
              </div>
            )}
            <button
              disabled={dbStatus === 'loading' || !dbDirty}
              onClick={saveMemoryToDB}
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
            <ScryfallImporter
              dbImportStatus={dbImportStatus}
              setDbImportStatus={setDbImportStatus}
              setDbDirty={setDbDirty}
            />
            <FileImporter
              dbImportStatus={dbImportStatus}
              setDbImportStatus={setDbImportStatus}
              setDbDirty={setDbDirty}
            />
          </div>
        </div>
      </Modal>
    </div>
  )
}
