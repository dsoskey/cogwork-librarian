import React, { KeyboardEvent, useContext, useRef, useState } from 'react'
import { EnrichedCard, SCORE_PRECISION } from '../../../api/queryRunnerCommon'
import { WEIGHT, QUERIES } from '../constants'
import { TaskStatus } from '../../../types'
import { FlagContext } from '../../../flags'
import { ScryfallIcon } from '../../component/scryfallIcon'
import "./cardImageView.css"
import { CardImage } from './cardImage'

export interface CardImageViewProps {
  card: EnrichedCard
  revealDetails: boolean
  visibleDetails: string[]
  onAdd: () => void
  onIgnore: () => void
}

const copyText = {
  unstarted: '📑',
  success: '✅',
  error: '🚨',
}

const copyTitle = {
  unstarted: 'copy json',
  success: 'successfully copied json',
  error: 'failed to copy json'
}

export const CardImageView = ({
  onAdd,
  onIgnore,
  card,
  revealDetails,
  visibleDetails,
}: CardImageViewProps) => {
  const { showDebugInfo } = useContext(FlagContext).flags
  const [hovered, setHovered] = useState(false)
  const cardViewRef = useRef<HTMLDivElement>()
  const [clipboardStatus, setClipboardStatus] =
    useState<TaskStatus>('unstarted')


  const copyToJson = () => {
    navigator.clipboard
      .writeText(JSON.stringify(card.data, undefined, 2))
      .then(() => {
        setClipboardStatus('success')
        setTimeout(() => {
          setClipboardStatus('unstarted')
        }, 3000)
      })
      .catch(() => {
        setClipboardStatus('error')
      })
  }

  const handleHoverOn = () => {
    cardViewRef.current?.focus()
    setHovered(true)
  }
  const handleHoverOff = () => {
    cardViewRef.current?.blur()
    setHovered(false)
  }

  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    switch (event.key) {
      case 'a':
        onAdd();
        break;
      default:
        break;
    }
  }


  return (
    <div className='card-view' ref={cardViewRef}
      tabIndex={-1}
      onKeyDown={handleKeyPress}
      onMouseOver={handleHoverOn}
      onMouseLeave={handleHoverOff}
    >
      <CardImage card={card.data} />
      {showDebugInfo && revealDetails && visibleDetails.includes(WEIGHT) &&
        <code className='card-weight'>{card.weight.toFixed(SCORE_PRECISION)}</code>}
      {hovered && <div className='hover-actions'>
        <a
          href={card.data.scryfall_uri.replace(/\?.*$/, '')}
          target='_blank'
          rel='noopener'
        >
          <button title='open in Scryfall'>
            <ScryfallIcon size='1em' />
          </button>
        </a>
        {showDebugInfo && <button title={copyTitle[clipboardStatus]} onClick={copyToJson}>
          {copyText[clipboardStatus]}
        </button>}
        <button title='ignore' onClick={onIgnore}>🚫</button>
        <button title='add to list' onClick={onAdd}>
          <span className='add-icon'>+</span>
        </button>
      </div>}
      {showDebugInfo && revealDetails && (
        <div className='detail'>
          <div>{card.data.name}</div>
          {visibleDetails.includes('oracle') && (
            <div>{card.data.oracle_text}</div>
          )}
          {visibleDetails.includes(QUERIES) && (
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
