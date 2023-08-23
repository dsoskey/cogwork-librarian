import { TextEditor } from './component/editor/textEditor'
import React from 'react'
import { Setter } from '../types'
import "./savedCards.css"
import { CopyToClipboardButton } from './component/copyToClipboardButton'

export interface SavedCardsProps {
  savedCards: string[]
  setSavedCards: Setter<string[]>
}


export const SavedCards = ({ savedCards, setSavedCards }: SavedCardsProps) => {

  return (
    <div className='saved-cards-root'>
      <CopyToClipboardButton
        className='copy-text'
        copyText={savedCards.join('\n')}
      />

      <TextEditor
        queries={savedCards}
        setQueries={setSavedCards}
        placeholder='add one card per line'
      />
    </div>
  )
}
