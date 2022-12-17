import cloneDeep from 'lodash/cloneDeep';
import React, { useState } from 'react'
import { Expander } from './expander';
import { Loader } from './loader';
import { EnrichedCard, Status } from './useQueryRunner';
import { QueryReport } from './useReporter';

interface CardViewProps {
    card: EnrichedCard
    revealed: boolean
    visibleDetails: Set<string>
    onAdd: () => void

}

export const CardView = ({ onAdd, card, revealed, visibleDetails }: CardViewProps) => {
    const [flipped, setFlipped] = useState(false)
    return (<div className='card-view'>
        <a href={card.data.scryfall_uri.replace(/\?.*$/, '')} target="_blank" rel="noopener">
            <img width="100%"
                src={flipped ? card.data.getBackImageURI('normal') : card.data.getFrontImageURI('normal')} 
                alt={card.data.name}
                title={card.data.name}
            />
        </a>
        <div className='add-button'>
            {card.data.card_faces.length > 1 && <button onClick={() => setFlipped(prev => !prev)}>flip</button>}
            <button onClick={onAdd}>add to list</button>
        </div>
        {revealed && <div className='detail'>
            <div>{card.data.name}</div>
            {visibleDetails.has(WEIGHT) && <div>weight: {card.weight.toPrecision(4)}</div>}
            {visibleDetails.has(QUERIES) && <>
                <div>matched queries:</div>
                <code>{card.matchedQueries.join(',\n')}</code>
            </>}
        </div>}
    </div>)
}

interface ResultsProps {
    status: Status
    result: Array<EnrichedCard>
    report: QueryReport
    addCard: (name: string) => void
}

const WEIGHT = 'weight'
const QUERIES = 'queries'
export const Results = React.memo(({ addCard, result, status, report }: ResultsProps) => {
    const [revealed, setRevealed] = useState(false)
    const [visibleDetails, setVisibleDetails] = useState(new Set(['weight', 'queries']))
    const [cardCount, setCardCount] = useState(100)

    if (status == Status.NotStarted) {
        return null
    }
    
    return <div className='results'>
        <div className="result-controls">
            <h2>
                {status === Status.Loading ? "running queries. please be patient..." : `displaying ${cardCount} of ${result.length} results`}
            </h2>
            <div>
                {status === Status.Loading && <div className="loader-holder">
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
                {status !== Status.Loading && <>
                    <input id="show-details" type='checkbox'
                        checked={revealed}
                        onChange={() => setRevealed((prev) => !prev)}
                    />
                    <label htmlFor="show-details">show details</label>
                    <Expander title='manage details'>
                        <div>
                            <input id="show-weight" type='checkbox'
                                checked={visibleDetails.has(WEIGHT)}
                                onChange={event => {
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

        {status !== Status.Loading && (
            <div className="result-container">
                {result.slice(0, cardCount).map(card => <CardView
                    onAdd={() => addCard(card.data.name)}
                    key={card.data.id}
                    card={card}
                    revealed={revealed}
                    visibleDetails={visibleDetails}
                />)}
                {cardCount < result.length && <button onClick={() => setCardCount(prev => prev + 100)}>load more</button>}
            </div>
        )}
    </div>
});