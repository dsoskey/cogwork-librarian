import cloneDeep from 'lodash/cloneDeep';
import React, { useState } from 'react'
import { CardView } from './cardView';
import { PAGE_SIZE, WEIGHT, QUERIES } from './constants';
import { Expander } from '../expander';
import { Loader } from '../loader';
import { useLocalStorage } from '../../api/local/useLocalStorage';
import { EnrichedCard } from '../../api/queryRunnerCommon';
import { TaskStatus } from '../../types';
import { QueryReport } from '../../api/useReporter';
import { PageControl } from './pageControl';

interface BrowserViewProps {
    status: TaskStatus
    result: Array<EnrichedCard>
    report: QueryReport
    addCard: (name: string) => void
}

export const BrowserView = React.memo(({ addCard, result, status, report }: BrowserViewProps) => {
    const [revealDetails, setRevealDetails] = useLocalStorage("reveal-details", false)
    const [visibleDetails, setVisibleDetails] = useLocalStorage("visible-details", new Set(['weight', 'queries']))
    // TODO make configurable
    const [pageSize] = useLocalStorage("page-size", PAGE_SIZE)
    const [page, setPage] = useState(0)
    const lowerBound = (page) * pageSize + 1
    const upperBound = (page + 1) * pageSize

    if (status == 'unstarted') {
        return null
    }
    
    return <div className='results'>
        <div className="result-controls">
            {status === "loading" && <h2>running queries. please be patient...</h2>}

            <div>
                {result.length > 0 && `${lowerBound} – ${Math.min(upperBound, result.length)} of ${result.length} cards`}
                {result.length === 0 && status !== "loading" && "0 cards found. We'll have more details on that soon :)"}
            </div>
           
            
            <PageControl
                page={page}
                setPage={setPage}
                pageSize={pageSize}
                upperBound={upperBound}
                cardCount={result.length}
            />
            
            <div>
                {status === 'loading' && <div className="loader-holder">
                    {report.start && `Time elapsed: ${(Date.now() - report.start) / 1000}s`}
                    {report.totalQueries > 0 && <Loader
                        label="queries curated"
                        width={500}
                        count={report.complete}
                        total={report.totalQueries}
                    />}
                    {report.totalCards > 0 && <Loader
                        label="ledgers shredded"
                        width={500}
                        count={report.cardCount}
                        total={report.totalCards}
                    />}
                </div>}
                {status !== 'loading' && <>
                    {report.start && report.end && `query ran in ${(report.end - report.start) / 1000}s`}
                    <input id="show-details" type='checkbox'
                        checked={revealDetails}
                        onChange={() => setRevealDetails((prev) => !prev)}
                    />
                    <label htmlFor="show-details">show details</label>
                    <Expander title='manage details'>
                        <div>
                            <input id="show-weight" type='checkbox'
                                checked={visibleDetails.has(WEIGHT)}
                                onChange={_ => {
                                    setVisibleDetails((prev) => {
                                        const next = cloneDeep(prev)
                                        if (next.has(WEIGHT)) {
                                            next.delete(WEIGHT)
                                        } else {
                                            next.add(WEIGHT)
                                        }
                                        return next
                                    })
                                }}
                            />
                            <label htmlFor="show-weight">weight</label>
                        </div>
                        <div>
                            <input id="show-queries" type='checkbox'
                                checked={visibleDetails.has(QUERIES)}
                                onClick={() => setVisibleDetails((prev) => {
                                    const next = cloneDeep(prev)
                                    if (next.has(QUERIES)) {
                                        next.delete(QUERIES)
                                    } else {
                                        next.add(QUERIES)
                                    }
                                    return next
                                })}
                            />
                            <label htmlFor="show-queries">queries</label>
                        </div>
                    </Expander>
                </>}
            </div>
        </div>

        {result.length > 0 && (
            <div className="result-container">
                {result.slice(lowerBound - 1, upperBound).map(card => <CardView
                    onAdd={() => addCard(card.data.name)}
                    key={card.data.id}
                    card={card}
                    revealDetails={revealDetails}
                    visibleDetails={visibleDetails}
                />)}
            </div>
        )}
    </div>
});