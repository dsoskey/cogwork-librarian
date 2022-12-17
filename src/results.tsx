import React, { useState } from 'react'
import { EnrichedCard } from './useQueryRunner';

interface CardViewProps {
    card: EnrichedCard
    revealed: boolean
}

export const CardView = ({ card, revealed }: CardViewProps) => {

    return (<div className='card-view'>
        <a href={card.data.scryfall_uri.replace(/\?.*$/, '')} target="_blank" rel="noopener">
            <img width="240px"
                src={card.data.getFrontImageURI('normal')} 
                alt={card.data.name}
            />
        </a>
        {revealed && <>
            <div>{card.data.name} ({card.data.id})</div>
            <div>weight: {card.weight}</div>
            <div>matched queries: {card.matchedQueries}</div>
        </>}
    </div>)
}

interface ResultsProps {
    result: Array<EnrichedCard>
}

export const Results = React.memo(({ result }: ResultsProps) => {
    const [revealed, setRevealed] = useState(false)

    if (result.length === 0) {
        return null
    }
    
    return <div>
        <h2>results ({result.length})</h2>
        <div>
            <input type='checkbox'
                value={revealed? 1:0}
                onClick={() => setRevealed((prev) => !prev)}
            />
        </div>
        <div className="result-container">
            {result.slice(0, 100).map(card => <CardView key={card.data.id} card={card} revealed={revealed} />)}
        </div>
    </div>
});