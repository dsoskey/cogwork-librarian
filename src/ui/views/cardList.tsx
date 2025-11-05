import { TextEditor } from '../component/editor/textEditor'
import React, { useCallback, useContext, useRef, useState } from 'react'
import { SettingsContext } from '../settingsView'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'
import { CardImageView } from '../cardBrowser/cardViews/cardImageView'
import "./cardList.css";
import { TwoPanelLayout } from '../layout/twoPanelLayout'
import { SearchHoverActions } from '../cardBrowser/cardViews/searchHoverActions'

export interface CardListProps {

}

const placeholder =
`Enter one card per line.
Valid formats include:
shock
2 grim lavamancer
4 lightning bolt (m11)
20 mountain (usg) 345
`

export function CardList() {
  const { lineHeight } = useContext(SettingsContext);

  const [listText, setListText] = useLocalStorage<string[]>('list-text' , ['']);
  const [debounced, setDebounced] = useState(listText)
  const timeout = useRef<number>();
  const handleListTextChange = (next: string[]) => {
    setListText(next);
    clearTimeout(timeout.current);
    timeout.current = setTimeout(() => {
      setDebounced(next);
    }, 300)
  }
  const cards = useLiveQuery(async () => {
    return cogDB.bulkGetList(debounced);
  }, [debounced]);

  return <TwoPanelLayout
    className="card-list-root"
    leftChild={<TextEditor
      queries={listText}
      setQueries={handleListTextChange}
      lineHeight={lineHeight}
      enableCopyButton
      gutterColumns={[]}
      placeholder={placeholder}
    />}
    rightChild={cards && <div className="result-container">
      {cards.map(({ quantity, card, name }, i) => name.length > 0 && !name.startsWith("#") && <div className="card-grid _4" key={i}>
        {!card ? <div className="card-not-found">{name} not found</div> : <CardImageView
          hoverContent={<SearchHoverActions card={{ data: card, matchedQueries: [], weight: 1 }} />}
          key={i.toString()}
          highlightFilter={() => false}
          card={{ data: card, matchedQueries: [], weight: 1 }}
        />}
        {card && <div className="quantity">{quantity ?? 1}</div>}
      </div>)}
    </div>}
    />
}