import React from "react";
import type { CardNode, GraphLink, GraphNode, SearchNode } from "./types";
import { CardDetailView } from "./cardDetailView";
import { SearchDetailView } from "./searchDetailView";
import { EnrichedCard } from '../../../api/queryRunnerCommon'

export interface NodeDetailViewProps {
    links: React.RefObject<GraphLink[]>;
    nodes: React.RefObject<GraphNode[]>;
    selectedNode: GraphNode;
    setSelectedNode: (node: GraphNode) => void;
    toggleLink: (source: string, target: string) => void;
    results: EnrichedCard[];
    runSearch: (query: string) => Promise<void>
    addNodes: (nodes: GraphNode[]) => void
}

export function NodeDetailView({ addNodes, selectedNode, links, nodes, setSelectedNode, toggleLink, results, runSearch }: NodeDetailViewProps) {
    switch (selectedNode.type) {
        case "search":
            return <SearchDetailView
                searchResults={results}
                runSearch={runSearch}
                searchNode={selectedNode as SearchNode}
                nodes={nodes}
                links={links}
                setSelectedNode={setSelectedNode}
                toggleLink={toggleLink}
                addNodes={addNodes}
            />
        case "card":
            return <CardDetailView
                cardNode={selectedNode as CardNode}
                nodes={nodes}
                links={links}
                setSelectedNode={setSelectedNode}
                toggleLink={toggleLink}
            />
    }
}