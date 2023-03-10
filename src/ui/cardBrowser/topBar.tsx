import { Loader } from '../component/loader'
import { QUERIES, WEIGHT } from './constants'
import { PageControl } from './pageControl'
import React, { useCallback, useMemo } from 'react'
import { DataSource, Setter, TaskStatus } from '../../types'
import { QueryReport } from '../../api/useReporter'
import { CogError } from '../../error'
import { useHighlightPrism } from '../../api/memory/syntaxHighlighting'

interface TopBarProps {
  // report metadata
  source: DataSource
  status: TaskStatus
  errors: CogError[]
  report: QueryReport
  activeCount: number
  searchCount: number
  ignoreCount: number
  // details control
  visibleDetails: string[]
  setVisibleDetails: Setter<string[]>
  revealDetails: boolean
  setRevealDetails: Setter<boolean>
  // page control
  lowerBound: number
  upperBound: number
  page: number
  setPage: Setter<number>
  pageSize: number
}

export const TopBar = ({
  status,
  report,
  activeCount,
  searchCount,
  ignoreCount,
  setVisibleDetails,
  visibleDetails,
  setRevealDetails,
  revealDetails,
  page,
  setPage,
  pageSize,
  lowerBound,
  upperBound,
  source,
  errors,
}: TopBarProps) => {
  const numErrors = Object.keys(errors ?? {}).length
  const errorText = useMemo(
    () => errors.map((it) => `- ${it.displayMessage}`).join('\n\n'),
    [errors]
  )
  useHighlightPrism([errorText, status])
  const toggleBase = (value: string) => () => {
    setVisibleDetails((prev) => {
      const next = new Set(prev)
      if (next.has(value)) {
        next.delete(value)
      } else {
        next.add(value)
      }
      return Array.from(next)
    })
  }
  const toggleWeight = useCallback(toggleBase(WEIGHT), [setVisibleDetails])
  const toggleQueries = useCallback(toggleBase(QUERIES), [setVisibleDetails])

  return (
    <div className='result-controls'>
      <div>
        {status === 'loading' && (
          <>
            <h2>running queries against {source}. please be patient...</h2>
            <div className='loader-holder'>
              {report.start &&
                `Time elapsed: ${(Date.now() - report.start) / 1000}s`}
              {report.totalQueries > 0 && (
                <Loader
                  label='queries curated'
                  width={500}
                  count={report.complete}
                  total={report.totalQueries}
                />
              )}
              {report.totalCards > 0 && (
                <Loader
                  label='ledgers shredded'
                  width={500}
                  count={report.cardCount}
                  total={report.totalCards}
                />
              )}
            </div>
          </>
        )}
        {status === 'error' && (
          <div>
            {report.start && report.end && (
              <>
                {source} query ran in {(report.end - report.start) / 1000}{' '}
                seconds and returned {numErrors} error
                {numErrors !== 1 ? 's' : ''}
              </>
            )}
            {
              <pre>
                <code className='language-scryfall'>{errorText}</code>
              </pre>
            }
          </div>
        )}
        {status === 'success' && (
          <>
            <div>
              {searchCount > 0 &&
                `${lowerBound} ??? ${Math.min(
                  upperBound,
                  searchCount
                )} of ${searchCount} cards. ignored ${ignoreCount} cards`}
              {searchCount === 0 &&
                "0 cards found. We'll have more details on that soon :)"}
            </div>
            {report.start && report.end && (
              <div>
                {source} query ran in {(report.end - report.start) / 1000}{' '}
                seconds
              </div>
            )}
            <div>
              <input
                id='show-details'
                type='checkbox'
                checked={revealDetails}
                onChange={() => setRevealDetails((prev) => !prev)}
              />
              <label htmlFor='show-details'>show query debug info</label>
              {revealDetails && (
                <div className='detail-controls'>
                  <div>
                    <input
                      id='show-weight'
                      type='checkbox'
                      checked={visibleDetails.includes(WEIGHT)}
                      onChange={toggleWeight}
                    />
                    <label htmlFor='show-weight'>weight</label>
                  </div>
                  <div>
                    <input
                      id='show-queries'
                      type='checkbox'
                      checked={visibleDetails.includes(QUERIES)}
                      onChange={toggleQueries}
                    />
                    <label htmlFor='show-queries'>queries</label>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
      {status !== 'error' && activeCount > 0 && (
        <PageControl
          page={page}
          setPage={setPage}
          pageSize={pageSize}
          upperBound={upperBound}
          cardCount={activeCount}
        />
      )}
    </div>
  )
}
