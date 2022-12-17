import React, { useState } from 'react'
import { EnrichedCard, Status } from './useQueryRunner';

interface CardViewProps {
    card: EnrichedCard
    revealed: boolean
    onAdd: () => void
}

export const CardView = ({ onAdd, card, revealed }: CardViewProps) => {
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
            <div>weight: {card.weight.toPrecision(4)}</div>
            <div>matched queries:</div>
            <code>{card.matchedQueries.join(',\n')}</code>
        </div>}
    </div>)
}

interface ResultsProps {
    status: Status
    result: Array<EnrichedCard>
    addCard: (name: string) => void
}

export const Results = React.memo(({ addCard, result, status }: ResultsProps) => {
    const [revealed, setRevealed] = useState(false)
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
                <input id="show-details" type='checkbox'
                    value={revealed? 1:0}
                    onClick={() => setRevealed((prev) => !prev)}
                />
                <label htmlFor="show-details">show details</label>
            </div>
        </div>
        {status !== Status.Loading && (
            <div className="result-container">
                {result.slice(0, cardCount).map(card => <CardView onAdd={() => addCard(card.data.name)} key={card.data.id} card={card} revealed={revealed} />)}
                {cardCount < result.length && <button onClick={() => setCardCount(prev => prev + 100)}>load more</button>}
            </div>
        )}
    </div>
});