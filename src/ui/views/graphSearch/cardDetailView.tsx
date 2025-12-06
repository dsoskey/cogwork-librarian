import React, {useMemo} from "react";
import {
    type CardNode,
    type GraphLink,
    type GraphNode,
    relatedNodeIds,
    type SearchNode
} from "./types";
import {RelatedSearchList} from "./relatedSearchList";
import {RelatedCardList} from "./relatedCardList";
import "./cardDetailView.css";
import { imageUris } from '../../../api/mtgjson'

export interface CardDetailViewProps {
    cardNode: CardNode;
    nodes: React.RefObject<GraphNode[]>;
    links: React.RefObject<GraphLink[]>
    setSelectedNode: (node: GraphNode) => void;
    toggleLink: (source: string, target: string) => void;
}

export function CardDetailView({ cardNode, nodes, links, setSelectedNode, toggleLink }: CardDetailViewProps) {
    const { card, id } = cardNode;

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


    return <section className="card-detail-view">
        <div className="row center">
            <h2>{card.name}</h2>
            <a
                href={`https://scryfall.com/card/${card.set}/${card.collector_number}`}
                target="_blank" rel="noopener noreferrer" >
                sf
            </a>
        </div>
        <img
            className="card-image"
            height={350}
            src={imageUris(card.id, 'front').normal}
            alt={card.name}
        />

        {relatedCards.length > 0 && <RelatedCardList
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

