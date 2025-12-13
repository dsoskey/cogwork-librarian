import React, { useEffect, useMemo, useRef, useState } from 'react'
import { CardLink } from "../../card/CardLink";
import type {CardNode, GraphNode} from "./types";
import { Card, DOUBLE_FACED_LAYOUTS } from 'mtgql'
import { useLocalStorage } from '../../../api/local/useLocalStorage'
import { PAGE_SIZE } from '../../cardBrowser/constants'
import { PageControl, PageInfo, usePageControl } from '../../cardBrowser/pageControl'
import { Setter } from '../../../types'

export interface RelatedCardListProps {
    relatedCards: CardNode[]
    setSelectedNode: (node: GraphNode) => void;
    toggleLink?: (target: string) => void;
    headerRef?: React.RefObject<HTMLElement>;
    endOfCardListRef?: React.RefObject<HTMLElement>;

}

export function RelatedCardList({ headerRef, endOfCardListRef, relatedCards, setSelectedNode, toggleLink }: RelatedCardListProps) {
    const [pageSize] = useLocalStorage('page-size', PAGE_SIZE)
    const { pageNumber, setPageNumber, lowerBound, upperBound } = usePageControl(pageSize, 0)
    const _setPageNumber: Setter<number> = (page)=>{
        setPageNumber(page);
        if (headerRef.current) {
            const scroll = document.documentElement.scrollTop;
            headerRef.current.scrollIntoView({ container: 'nearest' });
            document.documentElement.scroll(0,scroll);
        }
    }

    const currentPage = useMemo(
      () => {
          return relatedCards
            .slice(lowerBound, upperBound)
      },
      [relatedCards, lowerBound, upperBound]);
    useEffect(() => {
        setPageNumber(0)
    }, [relatedCards]);
    return <>
        <div className="related-header">
            <h3>related cards ({relatedCards.length})</h3>
            {relatedCards.length > pageSize && <div className='row center wrap'>
                <PageInfo
                  searchCount={relatedCards.length}
                  ignoreCount={0}
                  lowerBound={lowerBound + 1}
                  upperBound={upperBound}
                />
                <PageControl
                  pageNumber={pageNumber}
                  setPageNumber={_setPageNumber}
                  pageSize={pageSize}
                  upperBound={upperBound}
                  count={relatedCards.length}
                />
            </div>}
        </div>
        {relatedCards.length <= 2 && <div ref={endOfCardListRef} />}

        {relatedCards.length > 0 && <ul>
            {currentPage.map((rc, index) => <>
                <RelatedCard
                  card={rc.card} key={rc.id+index}
                  onCardClick={() => setSelectedNode(rc)}
                  hoverElement={toggleLink && <button onClick={() => toggleLink(rc.id)}>X</button>}
                />
                {index === currentPage.length - 2 && <li key="_______" style={{height: 0}} ref={endOfCardListRef} />}
            </>)}
        </ul>}
    </>;
}

export interface RelatedCardProps {
    card: Card;
    onCardClick?: () => void;
    hoverElement?: React.ReactNode;
}

export function RelatedCard({ card, onCardClick, hoverElement }: RelatedCardProps) {
    const [isOver, setIsOver] = useState(false);

    const onMouseEnter = () => {
        setIsOver(true);
    }

        const onMouseLeave = () => {
        setIsOver(false);
    }

    return <li className="related" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
        <CardLink
          name={DOUBLE_FACED_LAYOUTS.includes(card.layout) ? card.name.split(" // ")[0] : card.name}
          id={card.id}
          set={card.set}
          onClick={onCardClick}
        />
        {isOver && hoverElement}
    </li>
}

