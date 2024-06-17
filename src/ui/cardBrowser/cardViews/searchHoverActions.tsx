import React, { useContext } from 'react'
import { ScryfallIcon } from '../../component/scryfallIcon'
import { FlagContext } from '../../flags'
import { EnrichedCard } from '../../../api/queryRunnerCommon'
import { useCopyToClipboard } from '../../component/copyToClipboardButton'

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

export interface SearchHoverActionsProps {
  card: EnrichedCard
  onAdd: () => void
  onIgnore: () => void
}
export function SearchHoverActions({ card, onAdd, onIgnore }: SearchHoverActionsProps) {
  const { showDebugInfo } = useContext(FlagContext).flags
  const clipboardHandler = useCopyToClipboard(() => JSON.stringify(card.data, undefined, 2))
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
    {showDebugInfo && <button
      title={copyTitle[clipboardHandler.status]}
      onClick={clipboardHandler.onClick}

    >
      {copyText[clipboardHandler.status]}
    </button>}
    <button title='ignore' onClick={onIgnore}>🚫</button>
    <button title='add to list' onClick={onAdd}>
      <span className='add-icon'>+</span>
    </button>
  </div>
}