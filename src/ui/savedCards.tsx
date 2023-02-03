import { TextEditor } from './textEditor'
import React, { useState } from 'react'
import { Setter, TaskStatus } from '../types'

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
    <>
      <div className='row'>
        <h2>saved cards</h2>
        <button
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
      </div>

      <TextEditor
        queries={savedCards}
        setQueries={setSavedCards}
        placeholder='add one card per line'
      />
    </>
  )
}
