import React, { KeyboardEvent, useCallback, useMemo, useRef, useState } from 'react'
import './savedCards.css'
import { COPY_BUTTON_ICONS, CopyToClipboardButton } from './component/copyToClipboardButton'
import { CardEntry, parseEntry, serializeEntry } from '../api/local/types/cardEntry'
import { ProjectDao, splitPath } from '../api/local/useProjectDao'
import { Modal } from './component/modal'
import { HoverableInput } from './card/CardLink'
import { LastQueryDisplay } from './cardBrowser/lastQueryDisplay'
import { PencilIcon } from './icons/pencil'
import { TrashIcon } from './icons/trash'
import { useConfirmDelete } from './queryForm/useConfirmDelete'
import { SavedCardsMigrator } from './savedCards/savedCardsMigrator'
import _cloneDeep from 'lodash/cloneDeep'
import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core'
import { AddIcon } from './icons/add'
import { TextEditor } from './component/editor/textEditor'
import { FloppyDisk } from './icons/floppyDisk'
import { DragHandle } from './icons/dragHandle'
import { useMultiInputEditor } from './hooks/useMultiInputEditor'
import _isEqual from 'lodash/isEqual'
import { REFOCUS_TIMEOUT } from './flags'
import { Setter } from '../types'
import { SavedCardSection } from '../api/local/types/project'

import { CARD_INDEX } from '../api/local/cardIndex'

type PropsKeys = "path" | "savedCards" | "setSavedCards" | "renameQuery" | "removeCard"
export interface SavedCardsEditorProps extends Pick<ProjectDao, PropsKeys> {
}


export const SavedCardsEditor = React.memo((props: SavedCardsEditorProps) => {
  const { path,
    savedCards, setSavedCards,
    removeCard, renameQuery
  } = props;
  const [currentIndex, setCurrentIndex] = useState<number | undefined>(
    savedCards.length ? 0 : undefined
  )
  const [currentLine, setCurrentLine] = useState<string | undefined>(undefined);

  let ref= useRef(null);
  const confirmer = useConfirmDelete();

  const setQuerySelected = (selected: boolean, sectionIndex: number) => {
    setSavedCards((prev) => {
      const next = _cloneDeep(prev);
      next[sectionIndex].selected = selected;
      return next;
    })
  }

  const setCardEntry = (entry: CardEntry, sectionIndex: number, cardIndex: number) => {
    setSavedCards((prev) => {
      const next = _cloneDeep(prev);
      next[sectionIndex].cards[cardIndex] = entry;
      return next;
    })
  }

  const anyChecked = savedCards.filter(it=>it.selected).length > 0;
  const handleDeleteSections = () => {
    setSavedCards(prev => prev.filter(it => !it.selected));
  }


  const oldSaved = localStorage.getItem("saved-cards.coglib.sosk.watch")

  const copyText = useMemo(() => savedCards.map(i => i.cards.map(serializeEntry)).join('\n'), [savedCards]);

  return <div className='saved-cards-editor' ref={ref}>
    <div className='row center'>
      <h2>saved cards</h2>
      <CopyToClipboardButton
        className='copy-text'
        buttonText={COPY_BUTTON_ICONS}
        copyText={copyText}
      />
      {anyChecked && <button
        onClick={handleDeleteSections}
        title='delete checked queries'>
        <TrashIcon />
      </button>}
    </div>


    <DndContext onDragEnd={e => {
      if (e.over.id !== e.active.id) {
        const source = e.active.id as number;
        const destination = e.over.id as number;
        setSavedCards(prev => {
          const next = _cloneDeep(prev)
          const toMove = next[source];
          for (const card of toMove.cards) {
            const existingCard = next[destination].cards.find(it => it.name === card.name);
            if (existingCard) {
              existingCard.quantity = (existingCard.quantity ?? undefined) + card.quantity;
            } else {
              next[destination].cards.push(card);
            }
          }
          next.splice(source, 1);
          return next;
        })
      }

    }}>
      {oldSaved && <SavedCardsMigrator oldSaved={oldSaved} />}
      {savedCards.map((section, sectionIndex) =>
        <SavedSectionEditor
          key={section.query + sectionIndex}
          query={section.query}
          queryIndex={sectionIndex}
          querySelected={section.selected ?? false}
          cards={section.cards}
          setQuerySelected={(s) => setQuerySelected(s, sectionIndex)}
          setCardEntry={(cardEntry, index) => setCardEntry(cardEntry, sectionIndex, index)}
          currentIndex={currentIndex}
          currentLine={currentLine}
          setSavedCards={setSavedCards}
          setCurrentIndex={setCurrentIndex}
          setCurrentLine={setCurrentLine}
          removeCard={removeCard}
          renameQuery={renameQuery}
        />)}
    </DndContext>

    <AddQueryButton setSavedCards={setSavedCards} />
    {confirmer.confirming && <Modal
      className='modal-small'
      open={confirmer.confirming}
      title={<p className='alert'>
        You are about to delete the saved cards for {splitPath(path)[1]}. Continue?
      </p>}
      onClose={confirmer.hide}>

      <div className='row'>
        <button onClick={() => {
          setSavedCards([])
          confirmer.hide()
        }}>delete
        </button>
        <button onClick={confirmer.hide}>cancel</button>
      </div>
    </Modal>}
  </div>
});


interface SavedSectionEditorProps {
  query: string;
  queryIndex: number;
  querySelected: boolean;
  setQuerySelected: (selected: boolean) => void;
  cards: CardEntry[];
  setCardEntry: (cardEntry: CardEntry, index: number) => void;
  renameQuery: any
  removeCard: any
  setSavedCards: Setter<SavedCardSection[]>
  currentLine: string
  setCurrentLine: Setter<string>
  currentIndex: number
  setCurrentIndex: Setter<number>
}

function SavedSectionEditor({
  query, queryIndex,
  querySelected, setQuerySelected,
  cards, setCardEntry,
  renameQuery, removeCard, setSavedCards,
  currentLine, setCurrentLine,
  currentIndex, setCurrentIndex,
}: SavedSectionEditorProps) {
  const [editingQuery, setEditingQuery] = useState<boolean>(false)
  const [editValue, setEditValue] = useState<string>(query)

  const refCardContainer = useRef<HTMLDivElement>(null);
  const onKeyDown = useMultiInputEditor({
    container: refCardContainer,
    className: 'card-entry-editor',
    numInputs: cards.length,
    onAlt: (event, index) => {
      switch (event.code) {
        case "Digit1": {
          event.preventDefault();
          const nextEntry = {
            ...cards[index],
            quantity: (cards[index].quantity ?? 1) + 1
          }

          setCardEntry(nextEntry, index)
          setCurrentLine(serializeEntry(nextEntry))
          break;
        }
        case "Digit2":
          event.preventDefault();

          if ((cards[index].quantity ?? 0) <= 1) {
            // remove card
            const nextEntry = cards[index + 1];
            setSavedCards(prev => {
              const next = _cloneDeep(prev);
              next[queryIndex].cards.splice(index, 1);
              return next;
            })
            setCurrentLine(serializeEntry(nextEntry));
          } else {
            const nextEntry = {
              ...cards[index],
              quantity: cards[index].quantity - 1
            }

            setCardEntry(nextEntry, index)
            setCurrentLine(serializeEntry(nextEntry))
          }
      }
    },
    onEnter: (focusEntry, _index, splitIndex) => {
      const currentEntry = parseEntry(currentLine)

      if (splitIndex === 0) {
        setSavedCards(prev => {
          const next = _cloneDeep(prev);
          next[queryIndex].cards.splice(currentIndex, 1, { name: "" }, currentEntry)
          return next;
        })
        setCurrentIndex(prev=>prev + 1);
      } else {
        const quantStr = currentEntry.quantity ? currentEntry.quantity.toString()+" ": "";
        const firstHalf = `${quantStr}${currentEntry.name.substring(0, splitIndex)}`;
        const secondHalf = currentEntry.name.substring(splitIndex);
        setSavedCards(prev => {
          const next = _cloneDeep(prev);
          next[queryIndex].cards.splice(currentIndex, 1, parseEntry(firstHalf), parseEntry(secondHalf))
          return next;
        })
        setCurrentLine(secondHalf);
        setCurrentIndex(prev=>prev + 1);
      }

      setTimeout(() => {
        focusEntry(currentIndex, false, 0)
      }, REFOCUS_TIMEOUT);
    },
    onBackspace(focusEntry, index) {
      const parsedEntry = parseEntry(currentLine);
      setSavedCards(prev => {
        const next = _cloneDeep(prev);
        const nextSection = next[queryIndex]
        nextSection.cards.splice(index, 1);
        const nextEntry = nextSection.cards[index-1]
        if (nextEntry.name === "") {

          nextSection.cards[index-1] = parsedEntry;
        } else {
          nextSection.cards[index-1] = {
            ...nextEntry,
            name: nextEntry.name + parsedEntry.name
          }
        }
        return next;
      })
      const prevEntry = cards[index - 1];
      if (prevEntry.name === "") {
        setCurrentIndex(index - 1)
      } else {
        const serialized = serializeEntry(prevEntry);
        setCurrentLine(prev => `${serialized}${parseEntry(prev).name}`)
        setCurrentIndex(index - 1)
      }

      setTimeout(() => {
        focusEntry(index, true, prevEntry.name.length)
      }, REFOCUS_TIMEOUT);
    },
    onDelete(_focusEntry, index) {
      const nextEntry = cards[index + 1];
      setSavedCards(prev => {
        const next = _cloneDeep(prev);

        const nextSection = next[queryIndex]
        const nextEntry = nextSection.cards[index + 1];
        nextSection.cards[index] = { ...next[index], name:  currentLine + nextEntry.name}
        nextSection.cards.splice(index + 1, 1);
        return next;
      })
      setCurrentLine(prev => `${prev}${nextEntry.name}`)

      // No focus, we're already on the correct line
    }
  })

  const droppable = useDroppable({ id: queryIndex })
  const dropstyle = {
    backgroundColor: droppable.isOver ? 'var(--darker-color)' : undefined,
    borderColor: droppable.isOver ? 'var(--light-color)' : undefined,
  };
  const {attributes, active, listeners, setNodeRef, setActivatorNodeRef, transform} = useDraggable({
    id: queryIndex,
  });
  const dragstyle = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: 20,
  } : undefined;

  const dropIndicator = droppable.isOver
    ? droppable.over.id !== droppable.active.id && <div className="drop-indicator">merge into </div>
    : null;

  const copyText = useMemo(() => `\`\`\`\n${query}\n\`\`\`\n${cards.map(serializeEntry).join('\n')}`, [query, cards]);

  return <div ref={droppable.setNodeRef} style={dropstyle} className='saved-section-root'>

    <div className="saved-section-draggable" ref={setNodeRef} style={dragstyle} {...attributes}>
      {editingQuery && <TextEditor
        setQueries={setEditQueries}
        queries={editValue.split("\n")}
        gutterColumns={['multi-info']}
        language="scryfall-extended-multi"
        className={`editor-${queryIndex}`}
        settingsButton={<>
          <button onClick={handleSaveQuery} title="save query"><FloppyDisk /></button>
          <button title="cancel query changes" onClick={() => {
            setEditingQuery(false);
            setEditValue(query);
          }}><TrashIcon /></button>
          {dropIndicator}
        </>}
      />}

      {!editingQuery && <LastQueryDisplay
        lastQueries={query.split('\n')}
        selectBox={<>
          <button
            className={`drag-handle${active?.id ===queryIndex ? " active": ""}`}
            ref={setActivatorNodeRef}
            title="drag and drop to merge"
            {...listeners}
          ><DragHandle /></button>
          <input
            className='custom'
            type='checkbox'
            checked={querySelected}
            onChange={e => setQuerySelected(e.target.checked)}
          />
        </>}
        editorControls={<>
          <CopyToClipboardButton copyText={copyText} buttonText={COPY_BUTTON_ICONS} />
          <button onClick={handleEditQuery} title='edit query'><PencilIcon /></button>
          {dropIndicator}
        </>}
      />}

      <div ref={refCardContainer}>
        {cards.map((card, cardIndex) => <SavedCardInput
          key={cardIndex}
          card={card}
          cardIndex={cardIndex}
          queryIndex={queryIndex}
          onKeyDown={onKeyDown}
          setCurrentLine={setCurrentLine}
          setCurrentIndex={setCurrentIndex}
          syncLine={syncLine}
          setCardEntry={setCardEntry}
          removeCard={removeCard}
        />)}
      </div>
    </div>
  </div>

  function handleEditQuery() {
    setEditingQuery(true)
    setTimeout(() => {
      const element: HTMLTextAreaElement = document.querySelector(`.text-editor-root.editor-${queryIndex} .controller`);
      if (element) {
        element.focus?.()
        element.selectionStart = query.length;
        element.selectionEnd = query.length;

      }

    }, 50)
  }

  function handleSaveQuery() {
    renameQuery(queryIndex, editValue);
    setEditingQuery(false);
  }

  function setEditQueries(s: React.SetStateAction<string[]>) {
    const value = (Array.isArray(s) ? s : s(editValue.split('\n'))).join('\n');
    setEditValue(value);
  }


  function syncLine() {
    const newEntry = parseEntry(currentLine);
    if (cards[currentIndex] !== undefined && !_isEqual(newEntry, cards[currentIndex])) {
      setSavedCards(prev => {
        const next = _cloneDeep(prev)
        next[queryIndex].cards[currentIndex] = newEntry
        return next
      })
    }
  }
}

interface SavedCardInputProps {
  card: CardEntry;
  cardIndex: number;
  queryIndex: number;
  onKeyDown: (index: number) => (event: KeyboardEvent<HTMLInputElement>) => void;
  setCurrentLine: Setter<string>;
  setCurrentIndex: Setter<number>;
  syncLine: () => void;
  setCardEntry: (cardEntry: CardEntry, index: number) => void;
  removeCard: (queryIndex: number, cardIndex: number) => void;
}
function SavedCardInput({
  card,
  cardIndex,
  queryIndex,
  onKeyDown,
  setCurrentLine,
  setCurrentIndex,
  setCardEntry,
  syncLine,
  removeCard,
}: SavedCardInputProps) {

  return <div className='saved-card-row row center'>
    <div className='quantity'>{card.quantity}</div>
    <HoverableInput
      className="card-entry-editor"
      onKeyDown={onKeyDown(cardIndex)}
      onFocus={() => {
        setCurrentLine(serializeEntry(card))
        setCurrentIndex(cardIndex)
      }}
      onBlur={syncLine}
      value={card.name}
      getCompletions={CARD_INDEX.handleAutocomplete}
      onChange={(event) => {
        const newEntry = { ...card, name: event.target.value };
        setCurrentLine(serializeEntry(newEntry));
        setCardEntry(newEntry, cardIndex)

      }}
      setValue={value => {
        const newEntry = { ...card, name: value };
        setCurrentLine(serializeEntry(newEntry));
        setCardEntry(newEntry, cardIndex)
      }}
    />
    <button onClick={() => removeCard(queryIndex, cardIndex)}>X</button>
  </div>
}

function AddQueryButton({ setSavedCards }) {
  const addQuery = useCallback(() => {
    return setSavedCards(prev => [...prev, { query: "*", cards: [{ name: "" }] }])
  }, [setSavedCards]);

  return <button onClick={addQuery} className="row center"><AddIcon /> Add query</button>
}