import React from "react";
import { CardLink } from "../../card/CardLink";
import type {CardNode, GraphNode} from "./types";

export interface RelatedCardListProps {
    relatedCards: CardNode[]
    setSelectedNode: (node: GraphNode) => void;
    toggleLink?: (target: string) => void;
}

export function RelatedCardList({ relatedCards, setSelectedNode, toggleLink }: RelatedCardListProps) {

    return <>
        <h3>related cards ({relatedCards.length})</h3>
        <ul>
            {relatedCards.map(rc => <li className="related" key={rc.id}>
                <CardLink
                    name={rc.card.name}
                    id={rc.card.id}
                    set={rc.card.set}
                    onClick={() => setSelectedNode(rc)}
                />
                {toggleLink && <button onClick={() => toggleLink(rc.id)}>X</button>}
            </li>)}
        </ul>
    </>;
}

