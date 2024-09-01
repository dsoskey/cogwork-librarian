import React, { useContext } from 'react'
import { ScryfallIcon } from '../../component/scryfallIcon'
import { FlagContext } from '../../flags'
import { EnrichedCard } from '../../../api/queryRunnerCommon'
import { CopyToClipboardButton } from '../../component/copyToClipboardButton'

export const COPY_TEXT_EMOJIS = {
  unstarted: '📑',
  success: '✅',
  error: '🚨',
}

export const COPY_TITLE = {
  unstarted: 'copy json',
  success: 'successfully copied json',
  error: 'failed to copy json'
}

export interface SearchHoverActionsProps {
  card: EnrichedCard
  onAdd?: () => void
  onIgnore?: () => void
}
export function SearchHoverActions({ card, onAdd, onIgnore }: SearchHoverActionsProps) {
  const { showDebugInfo } = useContext(FlagContext).flags
  return <div className='hover-actions'>
    <a
      href={card.data.scryfall_uri.replace(/\?.+$/, '')}
      target='_blank'
      rel='noopener'
    >
      <button title='open in Scryfall'>
        <ScryfallIcon size='1em' />
      </button>
    </a>
    {showDebugInfo && <CopyToClipboardButton
      titleText={COPY_TITLE}
      buttonText={COPY_TEXT_EMOJIS}
      copyText={() => JSON.stringify(card.data, undefined, 2)}
    />}
    {onIgnore && <button title='ignore' onClick={onIgnore}>🚫</button>}
    {onAdd && <button title='add to list' onClick={onAdd}>
      <span className='add-icon'>+</span>
    </button>}
  </div>
}