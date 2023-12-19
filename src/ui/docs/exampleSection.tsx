import { CopyToClipboardButton } from '../component/copyToClipboardButton'
import { multiQueryInfo } from '../component/editor/multiQueryActionBar'
import { rankInfo } from '../component/editor/infoLines'
import React from 'react'
import { QueryExample } from '../../api/example'
import { idificate } from './renderer'

interface ExampleSectionProps {
  example: QueryExample
}
export const ExampleSection = ({ example }: ExampleSectionProps) => {
  return <div>
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
}

export const DocsExample = ({ example }: ExampleSectionProps) => {
  const id = `#${idificate(example.title)}`
  return <div>
    <div className='row center'>
      <h2 id={id}><a href={id}>#</a> {example.title}</h2>
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
}