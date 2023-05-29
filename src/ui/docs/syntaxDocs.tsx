import {
  keywords,
  keywordsToImplement,
} from '../../api/memory/types/filterKeyword'
import React from 'react'
import { syntaxDocs } from '../../api/local/syntaxDocs'
import { Link } from 'react-router-dom'
import "./syntaxDocs.css"

export const SyntaxDocsLink = () => <Link to='/user-guide'>syntax guide</Link>
export const SyntaxDocs = () => {
  return <div className='user-guide-root'>
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
      these keywords aren't supported yet, but that doesn't mean they
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
}
