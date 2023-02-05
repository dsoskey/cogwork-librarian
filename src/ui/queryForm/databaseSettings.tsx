import React from 'react'
import { useState } from 'react'
import { Modal } from '../component/modal'
import { Setter, TaskStatus } from '../../types'
import { Card } from 'scryfall-sdk'
import { Manifest } from '../../api/local/db'

export interface DatabaseSettingsProps {
  dbStatus: TaskStatus
  saveToDB: () => Promise<void>

  setMemory: Setter<Card[]>
  manifest: Manifest
  setManifest: Setter<Manifest>
}
export const DatabaseSettings = (
  { dbStatus, saveToDB, setMemory, manifest, setManifest }: DatabaseSettingsProps) => {
  const [modalOpen, setModalOpen] = useState<boolean>(false)

  return <>
    <button onClick={() => setModalOpen(true)}>database settings (icon me)</button>
    <Modal open={modalOpen} title='database settings' onClose={() => setModalOpen(false)} >

      <div>
        in memory
        <div>source: {manifest.uri}</div>
        <div>type: {manifest.id === "file" ? "file" : manifest.type}</div>
        <div>last updated: {manifest.updated_at}</div>

        <div className='row'>
          <label htmlFor='file-import'>import from file</label>
          <input id='file-import' type='file' accept='.json' onChange={(event) => {
            const file = event.target.files[0]
            const manifest: Manifest = {
              id: "file",
              uri: file.name,
              type: 'oracle_cards',
              updated_at: file.lastModified.toString(),
            }
            file.text()
              .then((content) => {
                setMemory(JSON.parse(content).map(Card.construct))
                setManifest(manifest)
              })
          }}/>
          <button>load from scryfall</button>
          <button disabled={dbStatus === 'loading'} onClick={() => {
            saveToDB()
          }}>sav{dbStatus === 'loading' ? 'ing' : 'e'} to local database</button>
          <button>export to file</button>
        </div>
      </div>
    </Modal>
  </>
}