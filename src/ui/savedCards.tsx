import { TextEditor } from './component/editor/textEditor'
import React, { useState } from 'react'
import { Setter, TaskStatus } from '../types'
import "./savedCards.css"

export interface SavedCardsProps {
  savedCards: string[]
  setSavedCards: Setter<string[]>
}

const buttonText = {
  unstarted: 'copy to clipboard',
  success: 'copied successfully!',
  error: 'there was an error copying',
}
export const SavedCards = ({ savedCards, setSavedCards }: SavedCardsProps) => {
  const [clipboardStatus, setClipboardStatus] =
    useState<TaskStatus>('unstarted')
  return (
    <div className='saved-cards-root'>
        <button
          className='copy-text'
          disabled={clipboardStatus !== 'unstarted'}
          onClick={() => {
            navigator.clipboard
              .writeText(savedCards.join('\n'))
              .then(() => {
                setClipboardStatus('success')
                setTimeout(() => {
                  setClipboardStatus('unstarted')
                }, 3000)
              })
              .catch(() => {
                setClipboardStatus('error')
              })
          }}
        >
          {buttonText[clipboardStatus]}
        </button>

      <TextEditor
        queries={savedCards}
        setQueries={setSavedCards}
        placeholder='add one card per line'
      />
    </div>
  )
}
