import { Modal } from '../modal'
import { queryExamples } from '../../api/example'
import React, { useContext, useState } from 'react'
import { Setter } from '../../types'
import { FlagContext } from '../../flags'
import { testQueries } from '../../api/queries'

export interface ExampleGalleryProps {
  setPrefix: Setter<string>
  setQueries: Setter<string[]>
}

export const ExampleGallery = ({
  setPrefix,
  setQueries,
}: ExampleGalleryProps) => {
  const [exampleOpen, setExampleOpen] = useState<boolean>(false)
  const { debug } = useContext(FlagContext)

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
                    setPrefix(example.prefix)
                    setQueries(example.queries)
                    setExampleOpen(false)
                  }}
                >
                  use example
                </button>
              </div>
              <pre className='language-scryfall-extended'>
                <code>{example.prefix}</code>
              </pre>
              <pre className='language-scryfall-extended'>
                <code>{example.queries.join('\n')}</code>
              </pre>
            </div>
          ))}
          {debug && (
            <pre className='language-scryfall-extended'>
              <code>{testQueries.join('\n')}</code>
            </pre>
          )}
        </div>
      </Modal>
    </>
  )
}
