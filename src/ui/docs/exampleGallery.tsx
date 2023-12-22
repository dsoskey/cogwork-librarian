import { queryExamples } from '../../api/example'
import React, { useContext } from 'react'
import { FlagContext } from '../../flags'
import { testQueries } from '../../api/queries'
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { ExampleSection } from './exampleSection'
export const ExampleGallery = () => {
  useHighlightPrism([])
  const { showDebugInfo } = useContext(FlagContext).flags

  return <div className='example-content'>
    <h3 id="query-examples"><a href="#query-examples">#</a> query examples</h3>
    {queryExamples.map((example) => <ExampleSection key={example.title} example={example} />)}
    {showDebugInfo && (
      <pre className='language-scryfall-extended'>
        <code>{testQueries.join('\n')}</code>
      </pre>
    )}
  </div>
}
