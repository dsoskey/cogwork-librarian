import { queryExamples } from '../../api/example'
import React, { useContext } from 'react'
import { FlagContext } from '../../flags'
import { testQueries } from '../../api/queries'
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { singleQueryInfo } from '../component/editor/singleQueryActionBar'
import { rankInfo } from '../component/editor/infoLines'
import { CopyToClipboardButton } from '../component/copyToClipboardButton'

export const ExampleGallery = () => {
  useHighlightPrism([])
  const { showDebugInfo } = useContext(FlagContext).flags

  return <div className='example-content'>
    {queryExamples.map((example) => (
      <div key={example.title}>
        <div className='row'>
          <h3>{example.title}</h3>
          <CopyToClipboardButton copyText={[example.prefix, ...example.queries].join('\n')} />
        </div>
        {example.description !== undefined && (
          <p>{example.description}</p>
        )}
        <div className='example-query'>
          <pre className='language-none'>
            <code>
              {singleQueryInfo(rankInfo)([
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
  </div>
}
