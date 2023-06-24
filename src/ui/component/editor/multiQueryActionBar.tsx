import React from 'react'
import { rankInfo } from './infoLines'
import { useHighlightPrism } from '../../../api/local/syntaxHighlighting'

export const multiQueryInfo = (renderSubquery: (count: number) => string = rankInfo) =>
  (queries: string[]): string[] => {
    if (queries.length === 0) {
      return []
    }
    const result = []
    let count = 0
    for (const line of queries) {
      if (line.trim().length === 0) {
        result.push(' ')
        count = 0
      } else if (line.trimStart().startsWith('#')) {
        result.push(' ')
      } else if (count === 0) {
        result.push('BASE')
        count += 1
      } else {
        result.push(renderSubquery(count))
        count += 1
      }
    }
    return result
  }

export interface MultiQueryInfoBarProps {
  queries: string[]
  renderQueryInfo: (queries: string[]) => string[]
  copyText: (mindex: number, maxdex: number) => void
  onSubmit: (baseIndex: number) => void
  canSubmit: boolean
}
export const MultiQueryActionBar = ({
  renderQueryInfo,
  queries,
  copyText,
  canSubmit,
  onSubmit,
}: MultiQueryInfoBarProps) => {
  useHighlightPrism([queries])
  const lineInfo = renderQueryInfo(queries)

  return <pre tabIndex={-1} className='language-none labels'>
    {lineInfo.map((line, index) => <div
      key={index}
      className={line.toLowerCase()}
      onClick={() => {
        const query = queries[index]
        const mindex = queries.slice(0, index).map(it => it.length)
          // the 1 accounts for \n
          .reduce((prev, next) => prev + next + 1, 0)
        // the 1 accounts for \n
        const maxdex = mindex + query.length + 1
        copyText(mindex, maxdex)
    }}>
      <code className={`multi-code ${line.toLowerCase()}`}>{line}</code>
      {line === "BASE" && <button
        onClick={(event) => {
          event.stopPropagation()
          onSubmit(index)
        }}
        disabled={!canSubmit}
        title='run query'
        className='run-query-button'>
        ▶️
      </button>}
    </div>)}
  </pre>
}