import { queryExamples } from '../../api/example'
import React, { useContext } from 'react'
import { FlagContext } from '../../flags'
import { testQueries } from '../../api/queries'
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { rankInfo } from '../component/editor/infoLines'
import { CopyToClipboardButton } from '../component/copyToClipboardButton'
import { multiQueryInfo } from '../component/editor/multiQueryActionBar'

export const ExampleGallery = () => {
  useHighlightPrism([])
  const { showDebugInfo } = useContext(FlagContext).flags

  return <div className='example-content'>
    {queryExamples.map((example) => (
      <div key={example.title}>
        <div className='row center'>
          <h3>{example.title}</h3>
          <CopyToClipboardButton copyText={[example.prefix, ...example.queries].join('\n')} />
        </div>
        {example.description !== undefined && (
          <p>{example.description}</p>
        )}
        <div className='example-query'>
          <pre className='language-none'>
            <code>
              {multiQueryInfo(rankInfo)([
                example.prefix,
                ...example.queries,
              ]).join('\n')}
            </code>
          </pre>
          <pre className='language-scryfall-extended-multi'>
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
