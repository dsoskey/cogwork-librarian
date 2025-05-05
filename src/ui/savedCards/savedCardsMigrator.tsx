import React, { useContext, useState } from 'react'
import { ProjectContext } from '../../api/local/useProjectDao'
import { parseEntry } from '../../api/local/types/cardEntry'
import { Modal } from '../component/modal'
import { CopyToClipboardButton } from '../component/copyToClipboardButton'

export interface SavedCardsMigratorProps {
  oldSaved: string
}

export function SavedCardsMigrator({ oldSaved }: SavedCardsMigratorProps) {
  const { setSavedCards, setCurrentIndex, setCurrentLine } = useContext(ProjectContext)
  const [migrateOpen, setMigrateOpen] = useState<boolean>(false)

  const handleMigration = () => {
    const parsed = JSON.parse(oldSaved)
    if (parsed.length > 0) {
      setSavedCards([{ query: '*', cards: parsed.map(parseEntry) }])
      setCurrentIndex(0)
      setCurrentLine(parsed[0])
    }
    localStorage.removeItem('saved-cards.coglib.sosk.watch')
    setMigrateOpen(false)
  }
  return <div>
    <p className='alert'>
      saved cards are now associated with projects.
      you have a saved card list that predates projects.
    </p>
    <button onClick={() => setMigrateOpen(true)}>migrate saved cards</button>
    <Modal open={migrateOpen} title={<h3>migrate saved cards</h3>} onClose={() => setMigrateOpen(false)}>
      <div className='column'>
          <textarea
            className='language-none coglib-prism-theme'
            value={JSON.parse(oldSaved).join('\n')}
            readOnly
            spellCheck={false}
          />
        <div className='row center'>
          <CopyToClipboardButton copyText={JSON.parse(oldSaved)?.join('\n')} />
          <button onClick={handleMigration}>move to current project</button>
        </div>
      </div>
    </Modal>
  </div>
}