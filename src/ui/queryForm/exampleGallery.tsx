import { queryExamples } from '../../api/example'
import React, { useContext, useState } from 'react'
import { Setter } from '../../types'
import { FlagContext } from '../../flags'
import { testQueries } from '../../api/queries'
import { rankInfo, renderQueryInfo } from '../component/textEditor'
import { Link, Redirect } from 'react-router-dom'
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'

export const ExampleGalleryLink = () => <Link to='/examples'>examples</Link>

export interface ExampleGalleryProps {
  setQueries: Setter<string[]>
}

export const ExampleGallery = ({ setQueries }: ExampleGalleryProps) => {
  useHighlightPrism([])
  const [redirectHome, setRedirectHome] = useState<boolean>(false)
  const { showDebugInfo } = useContext(FlagContext).flags

  return <div className='example-content'>
    {/*<h2>example queries</h2>*/}
    {queryExamples.map((example) => (
      <div key={example.title}>
        <div className='row'>
          <h3>{example.title}</h3>
          <button
            onClick={() => {
              setQueries([example.prefix, ...example.queries])
              setRedirectHome(true)
            }}
          >
            use example
          </button>
        </div>
        {example.description !== undefined && (
          <p>{example.description}</p>
        )}
        <div className='example-query'>
          <pre className='language-none'>
            <code>
              {renderQueryInfo(rankInfo)([
                example.prefix,
                ...example.queries,
              ]).join('\n')}
            </code>
          </pre>
          <pre className='language-scryfall-extended'>
            <code>{[example.prefix, ...example.queries].join('\n')}</code>
          </pre>
        </div>
      </div>
    ))}
    {showDebugInfo && (
      <pre className='language-scryfall-extended'>
        <code>{testQueries.join('\n')}</code>
      </pre>
    )}
    {redirectHome && <Redirect to='/' />}
  </div>
}
