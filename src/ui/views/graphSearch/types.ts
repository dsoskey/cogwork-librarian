import type {SimulationNodeDatum} from "d3-force";
import type {Card} from "mtgql";

export interface GraphNode extends SimulationNodeDatum {
    id: string;
    group: string;
    type: "card" | "search";
    size: number;
}

export function relatedNodeIds(links: GraphLink[], id: string): Set<string> {
    return new Set<string>(links
        .filter(link =>
            (link.source?.id ?? link.source) === id ||
            (link.target?.id ?? link.target) === id
        )
        .map(link => {
            if ((link.source?.id ?? link.source) === id) {
                return link.target?.id ?? link.target
            }
            return link.source?.id ?? link.source
        }));
}

export interface CardNode extends GraphNode {
    type: "card";
    card: Card;
}

export function cardToCardNode(card: Card, index: number): CardNode {
    return {
        id: `${card.name}-${index}`,
        group: colorGroup(card.colors??[]),
        type: 'card',
        size: 0,
        card,
    }
}

function colorGroup(list: string[]): string {
    if (list.length === 0) return 'c';
    if (list.length > 1) return 'm';
    return list[0].toLowerCase();
}

export interface SearchNode extends GraphNode {
    type: 'search';
    // size is visible size, total size is number of hits in entire search
    totalSize: number;
    filterFunc: (card: Card) => boolean;
}
export const DEFAULT_NO_MATCH_ID = "*"

export interface GraphLink {
    source: string;
    target: string;
    value: number;
}
export const DEFAULT_LINK_VALUE = 6;

