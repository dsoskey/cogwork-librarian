import React, { KeyboardEvent, useContext, useState } from 'react'
import { Card, ImageUris } from 'scryfall-sdk'
import { EnrichedCard, SCORE_PRECISION } from '../../../api/queryRunnerCommon'
import { WEIGHT, QUERIES } from '../constants'
import { DOUBLE_FACED_LAYOUTS } from '../../../api/memory/types/card'
import { TaskStatus } from '../../../types'
import { FlagContext } from '../../../flags'
import { ScryfallIcon } from '../../component/scryfallIcon'
import "./cardImageView.css"

export interface CardImageViewProps {
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
  const [flipped, setFlipped] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [clipboardStatus, setClipboardStatus] =
    useState<TaskStatus>('unstarted')
  const _card = card.data
  const version = 'normal'
  const imageSource = flipped
    ? getBackImageURI(_card, version)
    : _card.image_uris?.normal ?? _card.getFrontImageURI(version)

  const copyToJson = () => {
    navigator.clipboard
      .writeText(JSON.stringify(card, undefined, 2))
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

  const handleHoverOn = () => setHovered(true)
  const handleHoverOff = () => setHovered(false)

  // todo: debug why this doesn't work
  const handleKeyPress = (event: KeyboardEvent<HTMLDivElement>) => {
    console.log('key pressed!')
    event.stopPropagation()
    if (hovered) {
      switch (event.key) {
        case 'a':
          console.log("added!")
          onAdd();
          break;
        case 'i':
          console.log("ignored!")
          onIgnore();
          break;
        default:
          console.log(`unrecognized key: ${event.key}`)
          break
      }
    } else {
      console.log("not hovered!")
    }
  }


  return (
    <div className='card-view'
      onMouseOver={handleHoverOn}
      onMouseLeave={handleHoverOff}>
      <img
        width='100%'
        src={imageSource}
        alt={card.data.name}
        title={card.data.name}
        onError={() => {
          // load local backup
        }}
      />
      {DOUBLE_FACED_LAYOUTS.includes(card.data.layout) && (
        <button
          className='flip-button'
          onClick={() => setFlipped((prev) => !prev)}
          title='flip'
        >🔄</button>
      )}
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
          {visibleDetails.includes(WEIGHT) && (
            <div>
              weight: <code>{card.weight.toPrecision(SCORE_PRECISION)}</code>
            </div>
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
