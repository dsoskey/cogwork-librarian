import { Loader } from '../component/loader'
import { QUERIES, WEIGHT } from './constants'
import { PageControl } from './pageControl'
import React from 'react'
import { DataSource, Setter, TaskStatus } from '../../types'
import { QueryReport } from '../../api/useReporter'

interface TopBarProps {
  // report metadata
  source: DataSource
  status: TaskStatus
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
}: TopBarProps) => (
  <div className='result-controls'>
    {status === 'loading' && (
      <h2>running queries against {source}. please be patient...</h2>
    )}
    <div className='topbar'>
      <div>
        {searchCount > 0 &&
          `${lowerBound} – ${Math.min(
            upperBound,
            searchCount
          )} of ${searchCount} cards. ignored ${ignoreCount} cards`}
        {searchCount === 0 &&
          status !== 'loading' &&
          "0 cards found. We'll have more details on that soon :)"}
        <div>
          {status === 'loading' && (
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
          )}
          {status !== 'loading' && (
            <>
              {report.start &&
                report.end &&
                `${source} query ran in ${(report.end - report.start) / 1000}s`}

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
                        onChange={(_) => {
                          setVisibleDetails((prev) => {
                            const next = new Set(prev)
                            if (next.has(WEIGHT)) {
                              next.delete(WEIGHT)
                            } else {
                              next.add(WEIGHT)
                            }
                            return Array.from(next)
                          })
                        }}
                      />
                      <label htmlFor='show-weight'>weight</label>
                    </div>
                    <div>
                      <input
                        id='show-queries'
                        type='checkbox'
                        checked={visibleDetails.includes(QUERIES)}
                        onChange={() =>
                          setVisibleDetails((prev) => {
                            const next = new Set(prev)
                            if (next.has(QUERIES)) {
                              next.delete(QUERIES)
                            } else {
                              next.add(QUERIES)
                            }
                            return Array.from(next)
                          })
                        }
                      />
                      <label htmlFor='show-queries'>queries</label>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      <div>
        {activeCount > 0 && (
          <PageControl
            page={page}
            setPage={setPage}
            pageSize={pageSize}
            upperBound={upperBound}
            cardCount={activeCount}
          />
        )}
      </div>
    </div>
  </div>
)
