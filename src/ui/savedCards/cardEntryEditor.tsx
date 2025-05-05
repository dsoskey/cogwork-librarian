import { ProjectDao } from '../../api/local/useProjectDao'
import { CardEntry, serializeEntry } from '../../api/local/types/cardEntry'
import React, { KeyboardEvent } from 'react'

interface CardEntryEditorProps extends Pick<ProjectDao, 'currentLine' | 'setCurrentLine'> {
  card: CardEntry
  editing: boolean
  onBlur: () => void;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

function CardEntryEditor(props: CardEntryEditorProps) {
  const {
    card,
    editing,
    currentLine,
    setCurrentLine,
    onFocus,
    onBlur,
    onKeyDown
  } = props
  if (editing) {
    return <input
      className='card-entry-editor'
      value={currentLine}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={e => setCurrentLine(e.target.value)}
    />
  }
  return <input
    className='card-entry-editor'
    readOnly
    value={serializeEntry(card)}
    onFocus={onFocus}
    onBlur={onBlur}
  />
}