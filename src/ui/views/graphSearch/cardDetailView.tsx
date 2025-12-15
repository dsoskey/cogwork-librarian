import React, { useContext, useMemo, useRef } from 'react'
import {
    type CardNode,
    relatedNodeIds,
    type SearchNode
} from "./types";
import {RelatedSearchList} from "./relatedSearchList";
import {RelatedCardList} from "./relatedCardList";
import "./cardDetailView.css";
import { GraphControllerContext } from './useGraphController'
import { _CardImage } from '../../card/CardLink'
import { ScryfallIcon } from '../../icons/scryfallIcon'
import { TrashIcon } from '../../icons/trash'
import { DEFAULT_ICON_SIZE } from '../../icons/base'
import { scryfallCardLink } from '../../../api/scryfall/constants'

export interface CardDetailViewProps {
    cardNode: CardNode;
}

export function CardDetailView({ cardNode }: CardDetailViewProps) {
    const headerRef = useRef<HTMLElement>();

    const { card, id } = cardNode;
    const { nodes, links, removeNode, setSelectedNode, toggleLink } = useContext(GraphControllerContext);

    const { relatedCards, relatedSearches } = useMemo(() => {
        const relatedSearches: SearchNode[] = [];
        const relatedCards: CardNode[] = [];

        const relatedLinks = relatedNodeIds(links.current, cardNode.id);
        for (const node of nodes.current) {
            if (relatedLinks.has(node.id)) {
                switch (node.type) {
                    case 'card':
                        relatedCards.push(node as CardNode);
                        break;
                    case "search":
                        relatedSearches.push(node as SearchNode)
                }
            }
        }

        return { relatedSearches, relatedCards };
    }, [cardNode]);

    const handleDeleteClick = () => removeNode(cardNode.id);

    return <section className="card-detail-view">
        <div ref={headerRef}></div>
        <div className='detail-view-header row center'>
            <h2>{card.name}</h2>

            <a href={scryfallCardLink(card)}
               rel='noreferrer'
               target='_blank'
            >
                <button title='open in Scryfall'>
                    <ScryfallIcon size={DEFAULT_ICON_SIZE} />
                </button>
            </a>

            <button onClick={handleDeleteClick}><TrashIcon /></button>
        </div>
        <_CardImage card={card} name={card.name} nameFallback={false} />

        {relatedCards.length > 0 && <RelatedCardList
          headerRef={headerRef}
          relatedCards={relatedCards}
          setSelectedNode={setSelectedNode}
          toggleLink={(t) => toggleLink(id, t)}
        />}

        {relatedSearches.length > 0 && <RelatedSearchList
          relatedSearches={relatedSearches}
          setSelectedNode={setSelectedNode}
        />}
    </section>;
}

