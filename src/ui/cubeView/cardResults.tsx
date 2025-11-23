import React, { useContext } from 'react'
import { CardImageView } from '../cardBrowser/cardViews/cardImageView'
import { CubeViewModelContext, OrderedCard } from './useCubeViewModel'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { CardsPerRowControl } from '../component/cardsPerRowControl'
import { useViewportListener } from '../hooks/useViewportListener'
import { PrintPage } from './printPage'
import _groupBy from 'lodash/groupBy'
import { CardLink } from '../card/CardLink'
import { DOUBLE_FACED_LAYOUTS } from 'mtgql'
import { Checkbox } from '../component/checkbox/checkbox'
import _sortBy from 'lodash/sortBy'

export interface CardResultsLayoutProps {
  cards: OrderedCard[]
  filterControl: React.ReactNode;
  sortControl?: React.ReactNode;
  extraControls?: React.ReactNode;
}

type CubeDisplayType = "grid" | "visual spoiler"

export function CardResultsLayout({ cards, sortControl, filterControl, extraControls }: CardResultsLayoutProps) {
  const viewport = useViewportListener();
  const { cube, setActiveCard } = useContext(CubeViewModelContext);
  const [cardsPerRow, setCardsPerRow] = useLocalStorage('cards-per-row', 4)
  const [showCustomImage, setShowCustomImage] = useLocalStorage('cards-custom-image', true)

  const [displayType, setDisplayType] = useLocalStorage<CubeDisplayType>('cube-display-type', "visual spoiler")

  return <div className="card-list-root">
    <div className='list-control'>
      <div className="prose">{filterControl}</div>
      {sortControl}
      <div className='row center'>
        <label>
          <span className='bold'>display as: </span>
          <select value={displayType} onChange={e => setDisplayType(e.target.value as CubeDisplayType)}>
            <option value='grid'>classic grid</option>
            <option value='visual spoiler'>visual spoiler</option>
          </select>
        </label>
        <Checkbox
          checked={showCustomImage}
          onCheckedChange={setShowCustomImage}
          label="show custom images"
          checkboxPosition='end'
        />
        {displayType === 'visual spoiler' && viewport.width > 1024 &&
            <CardsPerRowControl
              setCardsPerRow={setCardsPerRow}
              cardsPerRow={cardsPerRow}
            />}
        {extraControls}
      </div>
    </div>

    {cards.length > 0 && <>
      {displayType === 'grid' && <ClassicCardList
        cards={groupCards(cards, 'color_category', 'type_line')}
        sort2By='cmc'
        showCustomImage={showCustomImage}
        onCardNameClick={setActiveCard}
      />}
      {displayType === 'visual spoiler' && <div className='result-container'>
        {cards.map((card, i) => <CardImageView
          key={card.id + i.toString()}
          className={`card-grid _${cardsPerRow}`}
          highlightFilter={() => false}
          card={{ data: card, matchedQueries: [`cube:${cube.key}`], weight: 1 }}
          onClick={() => setActiveCard(card)}
          altImageUri={showCustomImage ? card.alt_image_uri : undefined}
          altImageBackUri={showCustomImage ? card.alt_image_back_uri : undefined}
        />)}
      </div>}
      <PrintPage cards={cards} />
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
    if (key === "multi" || key === 'Multicolor' || key === 'Hybrid') {
      result[key] = _groupBy(_cards, (it) => (it.color_identity ?? it.colors).join(""));
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

const SORTS = {
  color_category: {
    white: 0,
    blue: 1,
    black: 2,
    red: 3,
    green: 4,
    colorless: 5,
    multicolored: 6,
    hybrid: 7,
  }
}
export function ClassicCardList({ sort2By, showCustomImage, onCardNameClick, cards }: ClassicCardListProps) {
  // todo: make this depend on group key
  const entries = _sortBy(Object.entries(cards), ([it]) => SORTS.color_category[it.toLowerCase()] ?? 8)
  return (
    <div className='classic-card-list-root row'>
      {entries.map(([groupby1, groupby2]) => (
        <ClassicCardColumn
          key={groupby1}
          title={groupby1}
          cards={groupby2}
          showCustomImage={showCustomImage}
          onCardNameClick={onCardNameClick}
        />
      ))}
    </div>
  )
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
        <div className={`column-subheader ${title.toLowerCase()}`}>{group2} [{cards.length}]</div>

        {Object.entries(_groupBy(cards, "cmc")).map(([_cmc, cards]) => <div className="column-subgroup">

          {cards.map((card, idx) => <div
            className={`column-cell ${cardKeyToGroupFunction.color_identity(card)}`}
            key={`${card.id}_${idx}`}
          >
            <CardLink
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



