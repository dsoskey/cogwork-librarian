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
      <div className='row center'>
        <h2>saved cards</h2>
        <CopyToClipboardButton
          className='copy-text'
          copyText={savedCards.join('\n')}
        />
      </div>

      <textarea
        className='language-none coglib-prism-theme'
        value={savedCards.join("\n")}
        placeholder='add one card per line'
        spellCheck={false}
        onChange={(event) => {
          setSavedCards(event.target.value.split("\n"))
        }}
        rows={savedCards.length}
      />
    </div>
  )
}
