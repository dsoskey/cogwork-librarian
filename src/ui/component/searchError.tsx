import React, { useMemo } from 'react'
import { QueryReport } from '../../api/useReporter'
import { DataSource } from '../../types'
import { CogError } from '../../error'

export interface SearchErrorProps {
  report: QueryReport
  source: DataSource
  errors: CogError[]

}
export const SearchError = ({ report, source, errors }: SearchErrorProps) => {
  const numErrors = errors.length
  const errorText = useMemo(
    () => errors.map((it) => `- ${it.displayMessage}`).join('\n\n'),
    [errors]
  )
  return <div>
    {report.start && report.end && (
      <>
        {source} query ran in {(report.end - report.start) / 1000}{' '}
        seconds and returned {numErrors} error
        {numErrors !== 1 ? 's' : ''}
      </>
    )}
    {
      <pre>
        <code className='language-none'>{errorText}</code>
      </pre>
    }
  </div>
}