import React, { useContext, useRef, useState } from 'react'
import { SettingsContext } from '../settingsContext'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'
import { CardImageView } from '../cardBrowser/cardViews/cardImageView'
import "./cardList.css";
import { TwoPanelLayout } from '../layout/twoPanelLayout'
import { SearchHoverActions } from '../cardBrowser/cardViews/searchHoverActions'
import { useSearchParams } from 'react-router-dom'
import { bytesToString } from '../../encoding'
import { Checkbox } from '../component/checkbox/checkbox'
import { LoaderText } from '../component/loaders'
import { TextEditor } from '../component/editor/textEditor'
import { PrinterIcon } from '../icons/printer'
import { CardsPerRowControl } from '../component/cardsPerRowControl'

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

  const [searchParams] = useSearchParams()

  const [cardsPerRow, setCardsPerRow] = useLocalStorage('cards-per-row', 4)
  const [showQuantity, setShowQuantity] = useLocalStorage('showQuantity', true);
  const [listText, setListText] = useLocalStorage<string[]>('list-text' , [''], (localStorageData) => {
    const encodedString = searchParams.get('s')
    if (encodedString) {
      return bytesToString(encodedString).split('\n')
    }
    return localStorageData
  });
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
    className='card-list-root'
    lChild={<TextEditor
      queries={listText}
      setQueries={handleListTextChange}
      lineHeight={lineHeight}
      enableCopyButton
      gutterColumns={[]}
      placeholder={placeholder}
    />}
    rInitialWidth={(width) => (width * 3) / 4}
    rChild={
      <div className='card-spoiler-root'>
        <div className='row'>
          <Checkbox
            checked={showQuantity}
            onCheckedChange={setShowQuantity}
            label='Show quantity'
            checkboxPosition='end'
          />
          <CardsPerRowControl
            cardsPerRow={cardsPerRow}
            setCardsPerRow={setCardsPerRow}
          />
          {/*<button onClick={print} title='print cube proxies'>*/}
          {/*  <PrinterIcon />*/}
          {/*</button>*/}
        </div>

        {cards === null && <LoaderText />}
        {cards && (
          <div className='result-container'>
            {cards.map(
              ({ quantity, card, name }, i) =>
                name.length > 0 &&
                !name.startsWith('#') && (
                  <div className={`card-grid _${cardsPerRow}`} key={i}>
                    {!card ? (
                      <div className='card-not-found'>{name} not found</div>
                    ) : (
                      <CardImageView
                        hoverContent={
                          <SearchHoverActions
                            card={{
                              data: card,
                              matchedQueries: [],
                              weight: 1,
                            }}
                          />
                        }
                        key={i.toString()}
                        highlightFilter={() => false}
                        card={{ data: card, matchedQueries: [], weight: 1 }}
                      />
                    )}
                    {showQuantity && card && (
                      <div className='quantity'>{quantity ?? 1}</div>
                    )}
                  </div>
                )
            )}
          </div>
        )}
      </div>
    }
  />
}