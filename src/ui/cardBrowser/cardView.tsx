import React, { useEffect, useState } from 'react'
import { Card, ImageUris } from 'scryfall-sdk'
import { EnrichedCard } from 'src/api/queryRunnerCommon'
import { WEIGHT, QUERIES } from './constants'
import { DOUBLE_FACED_LAYOUTS } from '../../api/card'
import Prism from 'prismjs'

export interface CardViewProps {
  card: EnrichedCard
  revealDetails: boolean
  visibleDetails: string[]
  onAdd: () => void
  onIgnore: () => void
}

const getBackImageURI = (card: Card, version: keyof ImageUris) => {
  return card.card_faces.length === 1
    ? ''
    : card.card_faces[1].image_uris[version] ?? ''
}

export const CardView = ({
  onAdd,
  onIgnore,
  card,
  revealDetails,
  visibleDetails,
}: CardViewProps) => {
  useEffect(() => {
    Prism.highlightAll()
  }, [card])
  const [flipped, setFlipped] = useState(false)
  const _card = card.data
  const imageSource = flipped
    ? getBackImageURI(_card, 'normal')
    : _card.image_uris?.normal ?? _card.getFrontImageURI('normal')

  return (
    <div className='card-view'>
      <a
        href={card.data.scryfall_uri.replace(/\?.*$/, '')}
        target='_blank'
        rel='noopener'
      >
        <img
          width='100%'
          src={imageSource}
          alt={card.data.name}
          title={card.data.name}
        />
      </a>
      <div className='add-button'>
        {DOUBLE_FACED_LAYOUTS.includes(card.data.layout) && (
          <button onClick={() => setFlipped((prev) => !prev)}>flip</button>
        )}
        <button onClick={onIgnore}>ignore</button>
        <button onClick={onAdd}>add to list</button>
      </div>
      {revealDetails && (
        <div className='detail'>
          <div>{card.data.name}</div>
          {visibleDetails.includes('oracle') && (
            <div>{card.data.oracle_text}</div>
          )}
          {visibleDetails.includes(WEIGHT) && (
            <div>weight: {card.weight.toPrecision(4)}</div>
          )}
          {visibleDetails.includes(QUERIES) && (
            <>
              <div>matched queries:</div>
              <code className='language-scryfall-extended'>
                {card.matchedQueries.join(',\n')}
              </code>
            </>
          )}
        </div>
      )}
    </div>
  )
}
