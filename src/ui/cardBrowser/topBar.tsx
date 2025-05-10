import { LoaderBar } from '../component/loaders'
import { QUERIES, WEIGHT } from './constants'
import React, { useCallback, useContext, useMemo } from 'react'
import { DataSource, Setter, TaskStatus } from '../../types'
import { QueryReport } from '../../api/useReporter'
import { CogError } from '../../error'
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { FlagContext } from '../flags'
import './topBar.css'
import { SearchError } from '../component/searchError'
import { LastQueryDisplay } from './lastQueryDisplay'


interface TopBarProps {
  // report metadata
  source: DataSource
  status: TaskStatus
  errors: CogError[]
  report: QueryReport
  // details control
  pageControl: React.ReactNode
  downloadButton: React.ReactNode
  vennControl: React.ReactNode
  cardsPerRowControl: React.ReactNode
  highlightFilterControl: React.ReactNode;
  displayTypesControl: React.ReactNode;
  visibleDetails: string[]
  setVisibleDetails: Setter<string[]>
  revealDetails: boolean
  setRevealDetails: Setter<boolean>
  lastQueries: string[]
}

export const TopBar = ({
  pageControl,
  downloadButton,
  vennControl,
  cardsPerRowControl,
  highlightFilterControl,
  displayTypesControl,
  lastQueries,
  status,
  report,
  setVisibleDetails,
  visibleDetails,
  setRevealDetails,
  revealDetails,
  source,
  errors,
}: TopBarProps) => {
  const { showDebugInfo } = useContext(FlagContext).flags
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
  const toggleWeight = useCallback(toggleBase(WEIGHT), [setVisibleDetails]);
  const toggleQueries = useCallback(toggleBase(QUERIES), [setVisibleDetails]);

  return (
    <div className='topbar'>
      <div className='result-info'>
        {status === 'loading' && (<>
          <h2>running queries against {source}. please be patient...</h2>
          <div className='loader-holder'>
            {report.start &&
              `Time elapsed: ${(Date.now() - report.start) / 1000}s`}
            {report.totalQueries > 0 && (
              <LoaderBar
                label='queries curated'
                width={500}
                count={report.complete}
                total={report.totalQueries}
              />
            )}
            {report.totalCards > 0 && (
              <LoaderBar
                label='ledgers shredded'
                width={500}
                count={report.cardCount}
                total={report.totalCards}
              />
            )}
          </div>
        </>)}
        {errors.length > 0 && <SearchError report={report} source={source} errors={errors}/>}
        {status === 'success' && (<div className="column">
          <LastQueryDisplay lastQueries={lastQueries} />
          {highlightFilterControl}
          {showDebugInfo && <div>
            {report.start && report.end && (
              <div>
                {source} query ran in {(report.end - report.start) / 1000}
                {' '}seconds
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
          </div>}
        </div>)}
      </div>
      {status === 'success' && vennControl}
      <div className='result-controls'>
        {pageControl}
        {downloadButton}
        {displayTypesControl}
        {cardsPerRowControl}
      </div>
    </div>
  )
}
