import {
  syntaxDocs,
  keywords,
  keywordsToImplement,
} from '../../api/memory/syntaxDocs'
import { useState } from 'react'
import { Modal } from '../component/modal'
import React from 'react'

export const SyntaxDocs = () => {
  const [open, setOpen] = useState<boolean>(false)
  return (
    <>
      <button onClick={() => setOpen(true)}>syntax guide</button>
      <Modal
        title={<h2>syntax guide</h2>}
        open={open}
        onClose={() => setOpen(false)}
      >
        <div className='syntax-guide'>
          <p className='alert'>
            this modal is under active construction. expect its location to
            change in the future!
          </p>

          <p>
            cogwork librarian's local processor uses a reverse-engineered
            variant of scryfall's syntax. listed below are full details on
            support and links to scryfall's documentation about them. please{' '}
            <a
              href='https://github.com/dsoskey/cogwork-librarian/issues/new?assignees=&labels=bug&template=bug_report.md&title='
              target='_blank'
              rel='noreferrer'
            >
              report any inconsistencies
            </a>{' '}
            you find between scryfall and cogwork librarian so we can make this
            tool the best it can be together :)
          </p>

          <h3 className='todo-supported-color'>supported keywords</h3>
          <ul>
            {Object.keys(keywords).map((keyword) => (
              <li key={keyword}>
                <a href={syntaxDocs[keyword]}>{keyword}</a>
              </li>
            ))}
          </ul>

          <h3 className='todo-unsupported-color'>unsupported keywords</h3>
          <p>
            these keywords haven't been created yet, but that doesn't mean they
            won't exist in the future!
          </p>
          <ul>
            {Object.keys(keywordsToImplement).map((keyword) => (
              <li key={keyword}>
                <a href={syntaxDocs[keyword]}>{keyword}</a>
              </li>
            ))}
          </ul>
        </div>
      </Modal>
    </>
  )
}
