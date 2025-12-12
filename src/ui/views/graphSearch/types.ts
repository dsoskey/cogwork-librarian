import type {SimulationNodeDatum} from "d3-force";
import { Card, QueryRunner } from 'mtgql'
import _cloneDeep from 'lodash/cloneDeep'
import { cogDB, COGDB_FILTER_PROVIDER } from '../../../api/local/db'

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
    oracle_id: string
    print_id: string
    card: Card;
}

export function cardToCardNode(card: Card, index: number): CardNode {
    return {
        id: `${card.name}__${index}`,
        group: colorGroup(card.colors??[]),
        type: 'card',
        size: 0,
        oracle_id: card.oracle_id,
        print_id: card.id,
        card,
    }
}

// todo: align color group with cube color category
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

export interface GraphState {
    nodes: GraphNode[];
    links: GraphLink[];
}

export function serializeGraph({ nodes, links }: GraphState): string {
    const _nodes = _cloneDeep(nodes);
    for (const node of _nodes) {
        delete node.fx;
        delete node.fy;
        delete node.x;
        delete node.y;
        delete node.vx;
        delete node.vy;
        if (node.type === 'card') {
            delete (node as CardNode).card
        } else {
            delete (node as SearchNode).filterFunc
        }
    }
    const _links = _cloneDeep(links);
    for (const link of _links) {
        if (link.source.id) link.source = link.source.id;
        if (link.target.id) link.target = link.target.id;
        delete link.x1;
        delete link.y1;
        delete link.x2;
        delete link.y2;
    }
    return JSON.stringify({ nodes: _nodes, links: _links });
}

export async function deserializeGraph(rawState: string): Promise<GraphState> {
    const { links, nodes } = JSON.parse(rawState) as GraphState;

    for (const node of nodes) {
        if (node.type === 'search') {
            (node as SearchNode).filterFunc = await QueryRunner
              .singleCardFilter(node.id.trim(), COGDB_FILTER_PROVIDER)
        } else {
            const cardNode = node as CardNode;
            cardNode.card = await cogDB.getCardByIds(cardNode.oracle_id, cardNode.print_id);
        }
    }

    return { nodes, links };
}