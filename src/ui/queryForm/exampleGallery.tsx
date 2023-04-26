import { Modal } from '../component/modal'
import { queryExamples } from '../../api/example'
import React, { useContext, useState } from 'react'
import { Setter } from '../../types'
import { FlagContext } from '../../flags'
import { testQueries } from '../../api/queries'
import { rankInfo, renderQueryInfo } from '../component/textEditor'

export interface ExampleGalleryProps {
  setQueries: Setter<string[]>
}

export const ExampleGallery = ({ setQueries }: ExampleGalleryProps) => {
  const [exampleOpen, setExampleOpen] = useState<boolean>(false)
  const { showDebugInfo } = useContext(FlagContext).flags

  return (
    <>
      <button onClick={() => setExampleOpen(true)}>browse examples</button>
      <Modal
        title={<h2>example queries</h2>}
        open={exampleOpen}
        onClose={() => setExampleOpen(false)}
      >
        <div className='example-content'>
          {queryExamples.map((example) => (
            <div key={example.title}>
              <div className='row'>
                <h3>{example.title}</h3>
                <button
                  onClick={() => {
                    setQueries([example.prefix, ...example.queries])
                    setExampleOpen(false)
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
        </div>
      </Modal>
    </>
  )
}
