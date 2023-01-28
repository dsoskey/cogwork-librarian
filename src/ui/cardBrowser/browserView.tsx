import React, { useMemo, useState } from 'react'
import { CardView } from './cardView'
import { PAGE_SIZE, WEIGHT, QUERIES } from './constants'
import { Loader } from '../loader'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { EnrichedCard } from '../../api/queryRunnerCommon'
import { DataSource, ObjectValues, TaskStatus } from '../../types'
import { QueryReport } from '../../api/useReporter'
import { PageControl } from './pageControl'
import { useViewportListener } from '../../viewport'
import { ResizeHandle } from '../resizeHandle'

interface BrowserViewProps {
  status: TaskStatus
  result: Array<EnrichedCard>
  report: QueryReport
  source: DataSource
  addCard: (name: string) => void
  addIgnoredId: (id: string) => void
  ignoredIds: string[]
}

const displays = {
  search: 'search',
  ignore: 'ignore',
} as const
type Display = ObjectValues<typeof displays>

const MIN = 500
export const BrowserView = React.memo(
  ({
    addCard,
    addIgnoredId,
    ignoredIds,
    result,
    status,
    source,
    report,
  }: BrowserViewProps) => {
    const viewport = useViewportListener()
    // TODO: Add collection switching
    const [displayedCollection, setDisplayedCollection] =
      useState<Display>('search')
    const ignoredIdSet = useMemo(() => new Set(ignoredIds), [ignoredIds])
    const displayableCards = useMemo(
      () => result.filter((it) => !ignoredIdSet.has(it.data.oracle_id)),
      [result, ignoredIdSet]
    )
    const ignoredCards = useMemo(
      () => result.filter((it) => ignoredIdSet.has(it.data.oracle_id)),
      [result, ignoredIdSet]
    )
    const cardsToDisplay = useMemo(() => {
      switch (displayedCollection) {
        case 'ignore':
          return ignoredCards
        case 'search':
          return displayableCards
      }
    }, [displayedCollection, ignoredCards, displayableCards])

    const [revealDetails, setRevealDetails] = useLocalStorage(
      'reveal-details',
      false
    )
    const [visibleDetails, setVisibleDetails] = useLocalStorage(
      'visible-details',
      ['weight', 'queries']
    )
    // TODO make configurable
    const [pageSize] = useLocalStorage('page-size', PAGE_SIZE)
    const [page, setPage] = useState(0)
    const lowerBound = page * pageSize + 1
    const upperBound = (page + 1) * pageSize

    const [width, setWidth] = useState<number>(viewport.width * 66)

    if (status == 'unstarted') {
      return null
    }

    const Content = () => (
      <div className='column content'>
        <div className='result-controls'>
          {status === 'loading' && (
            <h2>running queries against {source}. please be patient...</h2>
          )}

          <div className='topbar'>
            <div>
              {displayableCards.length > 0 &&
                `${lowerBound} – ${Math.min(
                  upperBound,
                  displayableCards.length
                )} of ${displayableCards.length} cards. ignored ${
                  ignoredCards.length
                } cards`}
              {displayableCards.length === 0 &&
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
                      `${source} query ran in ${
                        (report.end - report.start) / 1000
                      }s`}

                    <div>
                      <input
                        id='show-details'
                        type='checkbox'
                        checked={revealDetails}
                        onChange={() => setRevealDetails((prev) => !prev)}
                      />
                      <label htmlFor='show-details'>
                        show query debug info
                      </label>
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
              {displayableCards.length > 0 && (
                <PageControl
                  page={page}
                  setPage={setPage}
                  pageSize={pageSize}
                  upperBound={upperBound}
                  cardCount={displayableCards.length}
                />
              )}
            </div>
          </div>
        </div>

        {cardsToDisplay.length > 0 && (
          <div className='result-container'>
            {cardsToDisplay.slice(lowerBound - 1, upperBound).map((card) => (
              <CardView
                onAdd={() => addCard(card.data.name)}
                onIgnore={() => addIgnoredId(card.data.oracle_id)}
                key={card.data.id}
                card={card}
                revealDetails={revealDetails}
                visibleDetails={visibleDetails}
              />
            ))}
          </div>
        )}

        {viewport.mobile && displayableCards.length > 0 && (
          <div className='bottom-page-control'>
            <PageControl
              page={page}
              setPage={setPage}
              pageSize={pageSize}
              upperBound={upperBound}
              cardCount={displayableCards.length}
            />
          </div>
        )}
      </div>
    )

    return viewport.desktop ? (
      <div className='results' style={{ width }}>
        <ResizeHandle
          onChange={setWidth}
          min={MIN}
          max={viewport.width * 0.8}
          viewport={viewport}
        />
        <Content />
      </div>
    ) : (
      <div className='results'>
        <Content />
      </div>
    )
  }
)
