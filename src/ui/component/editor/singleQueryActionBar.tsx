import React from 'react'
import { rankInfo } from './infoLines'

export const singleQueryInfo =
  (renderSubquery: (count: number) => string = rankInfo) =>
    (queries: string[]): string[] => {
      if (queries.length === 0) {
        return []
      }
      const [_, ...rest] = queries
      let count = 1
      const result = ['BASE']
      rest.forEach((subQuery) => {
        if (
          subQuery.trimStart().startsWith('#') ||
          subQuery.trim().length === 0
        ) {
          result.push(' ')
        } else {
          result.push(renderSubquery(count))
          count += 1
        }
      })
      return result
    }

export interface SingleQueryActionBarProps {
  queries: string[]
  renderQueryInfo: (queries: string[]) => string[]
  copyText: (mindex: number, maxdex: number) => void
}
export const SingleQueryActionBar = ({
  renderQueryInfo,
  queries,
  copyText,
}: SingleQueryActionBarProps) => {
  const lineInfo = renderQueryInfo(queries)

  return <pre tabIndex={-1} className='language-none labels'>
    {lineInfo.map((line, index) => <code key={index} onClick={() => {
      const query = queries[index]
      const mindex = queries.slice(0, index).map(it => it.length)
        // the 1 accounts for \n
        .reduce((prev, next) => prev + next + 1, 0)
      // the 1 accounts for \n
      const maxdex = mindex + query.length + 1
      copyText(mindex, maxdex)
      // controller.current.focus()
      // controller.current.setSelectionRange(mindex, maxdex)
    }}>{line}</code>)}
  </pre>;
}