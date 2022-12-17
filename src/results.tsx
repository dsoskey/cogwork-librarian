import React, { useState } from 'react'
import { EnrichedCard } from './useQueryRunner';

interface CardViewProps {
    card: EnrichedCard
    revealed: boolean
}

export const CardView = ({ card, revealed }: CardViewProps) => {

    return (<div className='card-view'>
        <a href={card.data.scryfall_uri.replace(/\?.*$/, '')} target="_blank" rel="noopener">
            <img width="100%"
                src={card.data.getFrontImageURI('normal')} 
                alt={card.data.name}
            />
        </a>
        {revealed && <>
            <div>{card.data.name}</div>
            <div>weight: {card.weight.toPrecision(4)}</div>
            <div>matched queries:</div>
            <code>{card.matchedQueries.join(',\n')}</code>
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
    
    return <div className='results'>
        <div className="result-controls">
            <h2>{result.length} results</h2>
            <div>
                <input id="show-details" type='checkbox'
                    value={revealed? 1:0}
                    onClick={() => setRevealed((prev) => !prev)}
                />
                <label htmlFor="show-details">show details</label>
            </div>
        </div>
        <div className="result-container">
            {result.slice(0, 100).map(card => <CardView key={card.data.id} card={card} revealed={revealed} />)}
        </div>
    </div>
});