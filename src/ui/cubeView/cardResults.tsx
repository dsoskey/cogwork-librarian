import React, { useContext } from 'react'
import { CubeSort, useCubeSort } from './cubeSort'
import { CardImageView } from '../cardBrowser/cardViews/cardImageView'
import { CubeViewModelContext, OrderedCard } from './useCubeViewModel'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { CardsPerRowControl } from '../component/cardsPerRowControl'
import { useViewportListener } from '../hooks/useViewportListener'
import { PrintPage } from './printPage'
import _groupBy from 'lodash/groupBy'
import { CardLink2 } from '../card/CardLink'
import { DOUBLE_FACED_LAYOUTS } from 'mtgql'

export interface CardResultsLayoutProps {
  cards: () => OrderedCard[]
  filterControl: React.ReactNode;
  extraControls?: React.ReactNode;
}

type CubeDisplayType = "grid" | "visual spoiler"

export function CardResultsLayout({ cards, filterControl, extraControls }: CardResultsLayoutProps) {
  const viewport = useViewportListener();
  const { cube, setActiveCard } = useContext(CubeViewModelContext);
  const [cardsPerRow, setCardsPerRow] = useLocalStorage('cards-per-row', 4)
  const [showCustomImage, setShowCustomImage] = useLocalStorage('cards-custom-image', true)
  const { ordering, setOrdering, sorted } = useCubeSort(cards);

  const [displayType, setDisplayType] = useLocalStorage<CubeDisplayType>('cube-display-type', "visual spoiler")

  return <div className="card-list-root">
    <div className='list-control'>
      {filterControl}
      <CubeSort setOrdering={setOrdering} ordering={ordering} />
      <div className='row baseline'>
        <label>
          <span className='bold'>display as: </span>
          <select value={displayType} onChange={e => setDisplayType(e.target.value as CubeDisplayType)}>
            <option value='grid'>classic grid</option>
            <option value='visual spoiler'>visual spoiler</option>
          </select>
        </label>
        <label className='row center'>
          <span className='bold'>show custom images:</span>
          <input
            className='custom'
            type='checkbox'
            checked={showCustomImage}
            onChange={e => setShowCustomImage(e.target.checked)} />
        </label>
        {displayType === 'visual spoiler' && viewport.width > 1024 &&
            <CardsPerRowControl
              setCardsPerRow={setCardsPerRow}
              cardsPerRow={cardsPerRow}
            />}

        {extraControls}
      </div>
    </div>

    {sorted.length > 0 && <>
      {displayType === 'grid' && <ClassicCardList
        cards={groupCards(sorted, 'color_identity', 'type_line')}
        sort2By='cmc'
        showCustomImage={showCustomImage}
        onCardNameClick={setActiveCard}
      />}
      {displayType === 'visual spoiler' && <div className='result-container'>
        {sorted.map((card, i) => <CardImageView
          key={card.id + i.toString()}
          className={`card-grid _${cardsPerRow}`}
          highlightFilter={() => false}
          card={{ data: card, matchedQueries: [`cube:${cube.key}`], weight: 1 }}
          onClick={() => setActiveCard(card)}
          altImageUri={showCustomImage ? card.alt_image_uri : undefined}
          altImageBackUri={showCustomImage ? card.alt_image_back_uri : undefined}
        />)}
      </div>}
      <PrintPage cards={sorted} />
    </>}
  </div>;
}

const SUPERTYPES = new Set([
  "Legendary",
  "Snow",
  "Basic",
  "Token",
  "Tribal"
])

const cardKeyToGroupFunction = {
  color_identity: (card: OrderedCard) => {
    if (card.color_identity.length > 1) {
      return "multi";
    }
    if (card.color_identity.length === 0) {
      return "colorless";
    }

    return card.color_identity.join("").toLowerCase()
  },
  type_line: (card: OrderedCard) => {
    if (!card.type_line) return ""


    const [left, _right] = card.type_line.split("—")
    if (left.includes("Creature")) return "Creature"
    if (left.includes("Land")) return "Land"
    return left.trim()
      .split(" ")
      .filter(it => !SUPERTYPES.has(it))
      .join(" ");


  }
}

function groupCards(cards:OrderedCard[], groupby1: keyof OrderedCard, groupby2: keyof OrderedCard): DoubleGrouped<OrderedCard[]> {
  const result:any = _groupBy(cards, cardKeyToGroupFunction[groupby1] ?? groupby1);
  for (const key in result) {
    const _cards = result[key];
    if (key === "multi") {
      result[key] = _groupBy(_cards, (it) => it.color_identity.join(""));
    } else {
      result[key] = _groupBy(_cards, cardKeyToGroupFunction[groupby2] ?? groupby2);
    }
    result[key]._count = _cards.length;
  }

  return result as DoubleGrouped<OrderedCard[]>;
}

type DoubleGrouped<T> = {
  [groupby1: string]: { [groupby2: string]: T } & {
    _count: number
  }
}


export interface ClassicCardListProps {
  sort2By: string
  onCardNameClick: (card: OrderedCard) => void
  showCustomImage: boolean
  cards: DoubleGrouped<OrderedCard[]>
}

export function ClassicCardList({ sort2By, showCustomImage, onCardNameClick, cards }: ClassicCardListProps) {
  return <div className="classic-card-list-root row">
    {Object.entries(cards).map(([groupby1, groupby2]) => <ClassicCardColumn
      key={groupby1}
      title={groupby1}
      cards={groupby2}
      showCustomImage={showCustomImage}
      onCardNameClick={onCardNameClick}
    />)}
  </div>
}


export interface ClassicCardColumnProps {
  title: string
  onCardNameClick: (card: OrderedCard) => void
  showCustomImage: boolean
  cards: { [groupby2: string]: OrderedCard[] } & { _count: number }

}

export function ClassicCardColumn({ title, cards, onCardNameClick, showCustomImage }: ClassicCardColumnProps) {
    const { _count, ...rest } = cards;
    return <div className="card-column-root">
      <div className="column-header">{title} [{_count}]</div>
      {Object.entries(rest).map(([group2, cards]) => <div key={group2}>
        <div className={`column-subheader ${title}`}>{group2} [{cards.length}]</div>

        {Object.entries(_groupBy(cards, "cmc")).map(([_cmc, cards]) => <div className="column-subgroup">

          {cards.map((card, idx) => <div
            className={`column-cell ${cardKeyToGroupFunction.color_identity(card)}`}
            key={`${card.id}_${idx}`}
          >
            <CardLink2
              onClick={() => {
                onCardNameClick(card)
              }}
              lockable={false}
              id={card.id}
              imageSrc={showCustomImage ? card.alt_image_uri : undefined}
              name={DOUBLE_FACED_LAYOUTS.includes(card.layout) || card.layout === "adventure"
                ? card.name.split(" // ")[0]
                : card.name}
              hasBack={DOUBLE_FACED_LAYOUTS.includes(card.layout)}
            />
          </div>)}
        </div>)}
      </div>)}

    </div>;
}



