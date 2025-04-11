import React, { KeyboardEvent, useContext, useMemo, useRef, useState } from 'react'
import { EnrichedCard, SCORE_PRECISION } from '../../../api/queryRunnerCommon'
import { WEIGHT, QUERIES } from '../constants'
import { FlagContext } from '../../flags'
import "./cardImageView.css"
import { CardImage } from './cardImage'
import { CardCustomRender } from '../../card/cardCustomRender'
import { Card } from 'mtgql'

export interface CardImageViewProps {
  className?: string
  card: EnrichedCard
  onClick?: () => void
  highlightFilter: (card: Card) => boolean
  showRender?: boolean
  revealDetails?: boolean
  visibleDetails?: string[]
  onAdd?: () => void
  hoverContent?: React.ReactNode
  altImageUri?: string
  altImageBackUri?: string
}

export const CardImageView = ({
  onAdd,
  card,
  revealDetails,
  showRender,
  visibleDetails,
  className,
  onClick,
  hoverContent,
  altImageBackUri, altImageUri,
  highlightFilter,
}: CardImageViewProps) => {
  const { showDebugInfo } = useContext(FlagContext).flags
  const [hovered, setHovered] = useState(false)
  const cardViewRef = useRef<HTMLDivElement>()

  const handleHoverOn = () => {
    if (hoverContent) {
      cardViewRef.current?.focus({ preventScroll: true })
      setHovered(true)
    }
  }
  const handleHoverOff = () => {
    if (hoverContent) {
      cardViewRef.current?.blur()
      setHovered(false)
    }
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'a':
        onAdd?.();
        break;
      default:
        break;
    }
  }

  const href = card.data.scryfall_uri.replace(/\?.*$/, '')

  const highlightCard = useMemo(() => highlightFilter(card.data), [highlightFilter, card]);

  return (
    <div className={`card-view ${card.data.set} ${className}`} ref={cardViewRef}
      tabIndex={-1} onClick={onClick}
      onKeyDown={handleKeyPress}
      onMouseOver={handleHoverOn}
      onMouseLeave={handleHoverOff}
      onAuxClick={e => {
        if (e.button === 1) {
          window.open(href, "_blank");
        }
      }}
    >
      {showRender && <CardCustomRender card={card.data} />}
      {!showRender && <CardImage
        highlight={highlightCard}
        card={card.data}
        altImageBackUri={altImageBackUri}
        altImageUri={altImageUri}
      />}
      {showDebugInfo && revealDetails && visibleDetails?.includes(WEIGHT) &&
        <code className='card-weight'>{card.weight.toFixed(SCORE_PRECISION)}</code>}
      {hovered && hoverContent}
      {showDebugInfo && revealDetails && (
        <div className='detail'>
          <div>{card.data.name}</div>
          {visibleDetails?.includes('oracle') && (
            <div>{card.data.oracle_text}</div>
          )}
          {visibleDetails?.includes(QUERIES) && (
            <>
              <div>matched queries:</div>
              <code className='language-scryfall'>
                {card.matchedQueries.join(',\n')}
              </code>
            </>
          )}
        </div>
      )}
    </div>
  )
}
