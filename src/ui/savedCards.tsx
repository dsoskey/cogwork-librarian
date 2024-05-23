import React, { KeyboardEvent, useState } from 'react'
import "./savedCards.css"
import { CopyToClipboardButton } from './component/copyToClipboardButton'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import { CardEntry, parseEntry, serializeEntry } from '../api/local/types/cardEntry'
import { ProjectDao } from '../api/local/useProjectDao'
import { Modal } from './component/modal'

type PropsKeys = "path" | "savedCards" | "setSavedCards" | "currentLine" | "setCurrentLine" | "currentIndex" | "setCurrentIndex"
export type SavedCardsEditorProps = Pick<ProjectDao, PropsKeys>

interface CardEntryEditorProps extends Pick<ProjectDao, "currentLine" | "setCurrentLine">{
  card: CardEntry
  editing: boolean
  onBlur: () => void;
  onFocus: () => void;
  onKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

function focusEntry(index: number, backwards?: boolean, selection?: number) {
  const vector = backwards ? -1 : 1;
  const inputs = document.getElementsByClassName("card-entry-editor");
  const next = inputs.item(Math.min( Math.max(index + vector, 0), inputs.length - 1)) as HTMLInputElement;
  next.focus();
  if (selection !== undefined) {
    next.selectionStart = selection;
    next.selectionEnd = selection;
  }
}

function CardEntryEditor(props: CardEntryEditorProps) {
  const { card, editing, currentLine, setCurrentLine, onFocus, onBlur, onKeyDown } = props;
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


export function SavedCardsEditor(props: SavedCardsEditorProps) {
  const {
    path, savedCards, setSavedCards,
    currentIndex, setCurrentIndex,
    currentLine, setCurrentLine
  } = props

  const oldSaved = localStorage.getItem("saved-cards.coglib.sosk.watch")
  const [migrateOpen, setMigrateOpen] = useState<boolean>(false);
  const handleMigration = () => {
    const parsed = JSON.parse(oldSaved);
    if (parsed.length > 0) {
      setSavedCards(parsed.map(parseEntry))
      setCurrentIndex(0);
      setCurrentLine(parsed[0])
    }
    localStorage.removeItem("saved-cards.coglib.sosk.watch")
    setMigrateOpen(false)
  }
  const syncLine = () => {
    const newEntry = parseEntry(currentLine);
    if (savedCards[currentIndex] !== undefined && !isEqual(newEntry, savedCards[currentIndex])) {
      setSavedCards(prev => {
        const next = cloneDeep(prev)
        next[currentIndex] = newEntry
        return next
      })
    }
  }

  const onKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault()
        focusEntry(index);
        break;
      case "ArrowUp":
        event.preventDefault()
        focusEntry(index, true);
        break;
      case "Enter":
        if (event.currentTarget.selectionStart === event.currentTarget.selectionEnd) {
          event.preventDefault()
          const splitIndex = event.currentTarget.selectionStart;

          const firstHalf = currentLine.substring(0, splitIndex);
          const secondHalf = currentLine.substring(splitIndex);
          setSavedCards(prev => {
            const next = cloneDeep(prev);
            next.splice(currentIndex, 1, parseEntry(firstHalf), parseEntry(secondHalf))
            return next;
          })
          setCurrentLine(secondHalf);
          setCurrentIndex(prev=>prev + 1);

          setTimeout(() => {
            focusEntry(currentIndex, false, 0)
          }, 50);
        }
        break;
      case "Backspace":
        if (event.currentTarget.selectionStart === 0 &&
          event.currentTarget.selectionEnd === 0 &&
          index > 0) {
          event.preventDefault()

          const prevEntry = savedCards[index - 1];
          setSavedCards(prev => {
            const next = cloneDeep(prev);
            next.splice(index, 1);
            next[index-1] = { ...next[index-1], name: next[index-1].name + currentLine}
            return next;
          })
          const serialized = serializeEntry(prevEntry);
          setCurrentLine(prev => `${serialized}${prev}`)
          setCurrentIndex(index - 1)

          setTimeout(() => {
            focusEntry(index, true, serialized.length)
          }, 50);
        }
        break;
      case "Delete": {
        const { selectionStart, selectionEnd, value } = event.currentTarget;
        if (selectionStart === value.length && selectionEnd === value.length && index < savedCards.length - 1) {
          event.preventDefault();

          const nextEntry = savedCards[index + 1];
          setSavedCards(prev => {
            const next = cloneDeep(prev);
            const ne = prev[index + 1];
            next[index] = { ...next[index], name:  currentLine + ne.name}
            next.splice(index + 1, 1);
            return next;
          })
          setCurrentLine(prev => `${prev}${serializeEntry(nextEntry)}`)

          // No focus, we're already on the correct line
        }
        break;
      }
      default:
        break;
    }
  }


  return <div className='saved-cards-editor'>
    <div className='row center'>
      <h2>saved cards</h2>
      <CopyToClipboardButton
        className='copy-text'
        copyText={savedCards.map(serializeEntry).join('\n')}
      />
    </div>
    {oldSaved && <div>
      <p className='alert'>
        saved cards are now associated with projects.
        you have a saved card list that predates projects.
      </p>
      <button onClick={() => setMigrateOpen(true)}>migrate saved cards</button>
      <Modal open={migrateOpen} title={<h3>migrate saved cards</h3>} onClose={() => setMigrateOpen(false)}>
        <div className='column'>
          <textarea
            className='language-none coglib-prism-theme'
            value={JSON.parse(oldSaved).join("\n")}
            readOnly
            spellCheck={false}
          />
          <div className='row center'>
            <CopyToClipboardButton copyText={JSON.parse(oldSaved)?.join("\n")} />
            <button onClick={handleMigration}>move to current project</button>
          </div>
        </div>
      </Modal>
    </div>}
    {savedCards.map((card, index) =>
      <CardEntryEditor
        key={path + index}
        currentLine={currentLine} setCurrentLine={setCurrentLine}
        editing={index === currentIndex}
        card={card}
        onKeyDown={onKeyDown(index)}
        onFocus={() => {
          setCurrentLine(serializeEntry(card))
          setCurrentIndex(index)
        }}
        onBlur={syncLine}
      />)}
  </div>
}