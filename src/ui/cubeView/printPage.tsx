import React, { useMemo } from 'react'
import _chunk from 'lodash/chunk'
import { CardImageView } from '../cardBrowser/cardViews/cardImageView'
import { DOUBLE_FACED_LAYOUTS } from 'mtgql'
import { OrderedCard } from './useCubeViewModel'

export interface PrintPageProps {
    cards: OrderedCard[]
}

export function PrintPage({ cards }: PrintPageProps) {
    const printFaces = useMemo(() => {
        return cards.flatMap(card => {
            if (DOUBLE_FACED_LAYOUTS.includes(card.layout)) {
                return [
                    card,
                    {...card, card_faces: [card.card_faces[1], card.card_faces[0]]}
                ]
            } else {
                return [card]
            }
        })
    }, [cards])

    return <>
        {_chunk(printFaces, 9).map((chunk, index) => <div className="print-page" key={index}>
            {chunk.map((card, i) => <CardImageView
              key={card.id + i.toString()}
              card={{ data: card, matchedQueries: [], weight: 1 }}
              highlightFilter={() => false}
            />)}
        </div>)}
    </>;
}

