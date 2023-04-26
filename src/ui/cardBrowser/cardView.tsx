import React, { useContext, useState } from 'react'
import { Card, ImageUris } from 'scryfall-sdk'
import { EnrichedCard, SCORE_PRECISION } from '../../api/queryRunnerCommon'
import { WEIGHT, QUERIES } from './constants'
import { DOUBLE_FACED_LAYOUTS } from '../../api/card'
import { TaskStatus } from '../../types'
import { FlagContext } from '../../flags'

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

const copyText = {
  unstarted: '📑',
  success: '✅',
  error: '🚨',
}

export const CardView = ({
  onAdd,
  onIgnore,
  card,
  revealDetails,
  visibleDetails,
}: CardViewProps) => {
  const { showDebugInfo } = useContext(FlagContext)
  const [flipped, setFlipped] = useState(false)
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
          onError={() => {
            // load local backup
          }}
        />
      </a>
      <div className='add-button'>
        {DOUBLE_FACED_LAYOUTS.includes(card.data.layout) && (
          <button onClick={() => setFlipped((prev) => !prev)}>flip</button>
        )}
        {showDebugInfo && <button onClick={copyToJson}>
          {copyText[clipboardStatus]}
        </button>}
        <button onClick={onIgnore}>ignore</button>
        <button onClick={onAdd}>add to list</button>
      </div>
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
