import React, { KeyboardEvent, useCallback, useContext, useMemo, useRef, useState } from 'react'
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
import { SettingsContext } from './settingsContext'
import { useNavigate } from 'react-router'
import { stringToBytes } from '../encoding'
import { Checkbox } from './component/checkbox/checkbox'

type PropsKeys = "path" | "savedCards" | "setSavedCards" | "renameQuery"
export interface SavedCardsEditorProps extends Pick<ProjectDao, PropsKeys> {
}


export const SavedCardsEditor = React.memo((props: SavedCardsEditorProps) => {
  const {
    path, savedCards, setSavedCards, renameQuery
  } = props;
  const ref = useRef(null);
  const confirmer = useConfirmDelete();
  const navigate = useNavigate()
  const [error, setError] = useState('')

  const setQuerySelected = (selected: boolean, sectionIndex: number) => {
    setSavedCards((prev) => {
      const next = _cloneDeep(prev);
      next[sectionIndex].selected = selected;
      return next;
    })
  }

  const setSectionsCards = (cards: string[], sectionIndex: number) => {
    setSavedCards((prev) => {
      const next = _cloneDeep(prev);
      next[sectionIndex].cards = cards;
      return next;
    })
  }

  const anyChecked = savedCards.filter(it=>it.selected).length > 0;
  const handleDeleteSections = () => {
    setSavedCards(prev => prev.filter(it => !it.selected));
  }


  const oldSaved = localStorage.getItem("saved-cards.coglib.sosk.watch")

  const copyText = useMemo(() => savedCards
    .flatMap(i => i.cards).join('\n'), [savedCards]);

  const openInListView = () => {
    setError('')
    try {
      navigate(`/list?s=${stringToBytes(copyText)}`)
    } catch (e) {
      setError('Saved card list is too big to encode')
    }
  }

  return <div className='saved-cards-editor' ref={ref}>
    <div className='row center'>
      <h2>saved cards</h2>
      <CopyToClipboardButton
        className='copy-text'
        buttonText={COPY_BUTTON_ICONS}
        copyText={copyText}
      />
      <button onClick={openInListView}>open in list</button>
      {anyChecked && <button
        onClick={handleDeleteSections}
        title='delete checked queries'>
        <TrashIcon />
      </button>}
    </div>

    {error && <div>{error}</div>}


    <DndContext onDragEnd={e => {
      if (e.over.id !== e.active.id) {
        const source = e.active.id as number;
        const destination = e.over.id as number;
        setSavedCards(prev => {
          const next = _cloneDeep(prev)
          const toMove = next[source];
          for (const card of toMove.cards) {
            const cardToMove = parseEntry(card);
            const nextEntries = next[destination].cards.map(parseEntry);
            const foundIndex = nextEntries.findIndex(it =>
              it.name === cardToMove.name
              && (cardToMove.quantity === undefined || (it.set ?? cardToMove.set) === cardToMove.set)
              && (cardToMove.cn === undefined || (it.cn ?? cardToMove.cn) === cardToMove.cn)
            );
            if (foundIndex >= 0) {
              const existingCard = nextEntries[foundIndex];
              existingCard.quantity = (existingCard.quantity ?? 1) + (cardToMove.quantity ?? 1);
              existingCard.cn = existingCard.cn ?? cardToMove.cn;
              existingCard.set = existingCard.set ?? cardToMove.set;
              next[destination].cards[foundIndex] = serializeEntry(existingCard);
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
          setCards={(cards) => setSectionsCards(cards, sectionIndex)}
          setQuerySelected={(s) => setQuerySelected(s, sectionIndex)}
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
  cards: string[];
  setCards: (cards: string[]) => void;
  renameQuery: any
}

function SavedSectionEditor({
  query, queryIndex,
  querySelected, setQuerySelected,
  cards, setCards,
  renameQuery,
}: SavedSectionEditorProps) {
  const {lineHeight} = useContext(SettingsContext);
  const [editingQuery, setEditingQuery] = useState<boolean>(false);
  const [editValue, setEditValue] = useState<string>(query);

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

  const copyText = useMemo(() => `\`\`\`\n${query}\n\`\`\`\n${cards.join('\n')}`, [query, cards]);

  return <div ref={droppable.setNodeRef} style={dropstyle} className='saved-section-root'>

    <div className="saved-section-draggable" ref={setNodeRef} style={dragstyle} {...attributes}>
      {editingQuery && <TextEditor
        setQueries={setEditQueries}
        queries={editValue.split("\n")}
        gutterColumns={['multi-info']}
        language="scryfall-extended-multi"
        className={`editor-${queryIndex}`}
        lineHeight={lineHeight}
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
          <Checkbox checked={querySelected} onCheckedChange={setQuerySelected} />
        </>}
        editorControls={<>
          <CopyToClipboardButton copyText={copyText} buttonText={COPY_BUTTON_ICONS} />
          <button onClick={handleEditQuery} title='edit query'><PencilIcon /></button>
          {dropIndicator}
        </>}
      />}

      <TextEditor gutterColumns={[]} setQueries={setCards} queries={cards} />
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
}

function AddQueryButton({ setSavedCards }) {
  const addQuery = useCallback(() => {
    return setSavedCards(prev => [...prev, { query: "*", cards: [""] }])
  }, [setSavedCards]);

  return <button onClick={addQuery} className="row center"><AddIcon /> Add query</button>
}