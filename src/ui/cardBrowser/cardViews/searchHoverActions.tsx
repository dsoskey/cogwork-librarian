import React, { useContext } from 'react'
import { ScryfallIcon } from '../../icons/scryfallIcon'
import { FlagContext } from '../../flags'
import { EnrichedCard } from '../../../api/queryRunnerCommon'
import { LINK_BUTTON_ICONS, CopyToClipboardButton } from '../../component/copyToClipboardButton'
import { BlockIcon } from '../../icons/block'
import { AddIcon } from '../../icons/add'
import { DEFAULT_ICON_SIZE } from '../../icons/base'
import { scryfallCardLink } from '../../../api/scryfall/constants'

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
  return <div className='hover-actions'>
    <a
      href={scryfallCardLink(card.data)}
      target='_blank'
      rel='noopener'
    >
      <button title='open in Scryfall'>
        <ScryfallIcon size={DEFAULT_ICON_SIZE} />
      </button>
    </a>
    <CopyToClipboardButton
      titleText={COPY_TITLE}
      buttonText={LINK_BUTTON_ICONS}
      copyText={() => JSON.stringify(card.data, undefined, 2)}
    />
    {onIgnore && <button title='ignore' onClick={onIgnore}>
      <BlockIcon />
    </button>}
    {onAdd && <button title='add to list' onClick={onAdd}>
      <AddIcon />
    </button>}
  </div>
}