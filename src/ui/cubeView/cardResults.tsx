import React, { useContext } from 'react'
import { CubeSort, useCubeSort } from './cubeSort'
import { CardImageView } from '../cardBrowser/cardViews/cardImageView'
import { CubeViewModelContext, OrderedCard } from './useCubeViewModel'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { CardsPerRowControl } from '../component/cardsPerRowControl'
import { useViewportListener } from '../viewport'
import { PrintPage } from './printPage'

export interface CardResultsLayoutProps {
  cards: () => OrderedCard[]
  filterControl: React.ReactNode;
  extraControls?: React.ReactNode;
}

export function CardResultsLayout({ cards, filterControl, extraControls }: CardResultsLayoutProps) {
  const viewport = useViewportListener();
  const { cube, setActiveCard } = useContext(CubeViewModelContext);
  const [cardsPerRow, setCardsPerRow] = useLocalStorage('cards-per-row', 4)
  const [showCustomImage, setShowCustomImage] = useLocalStorage('cards-custom-image', true)
  const { ordering, setOrdering, sorted } = useCubeSort(cards);

  return <div className="card-list-root">
    <div className='list-control'>
      {filterControl}
      <CubeSort setOrdering={setOrdering} ordering={ordering} />
      <div className="row">
        <label className="row center">
          <span className="bold">show custom images:</span>
          <input
            className="custom"
            type="checkbox"
            checked={showCustomImage}
            onChange={e => setShowCustomImage(e.target.checked)} />
        </label>
        {viewport.width > 1024 && <CardsPerRowControl setCardsPerRow={setCardsPerRow} cardsPerRow={cardsPerRow} />}
        {extraControls}
      </div>
    </div>

    {sorted.length > 0 && <>
      <div className='result-container'>
        {sorted.map((card, i) => <CardImageView
          key={card.id + i.toString()}
          className={`_${cardsPerRow}`}
          card={{ data: card, matchedQueries: [`cube:${cube.key}`], weight: 1 }}
          onClick={() => setActiveCard(card)}
          altImageUri={showCustomImage ? card.alt_image_uri : undefined}
          altImageBackUri={showCustomImage ? card.alt_image_back_uri : undefined}
        />)}
      </div>
      <PrintPage cards={sorted} />
    </>}
  </div>;
}

