import React, { useContext } from 'react'
import type { CardNode, SearchNode } from "./types";
import { CardDetailView } from "./cardDetailView";
import { SearchDetailView } from "./searchDetailView";
import { EnrichedCard } from '../../../api/queryRunnerCommon'
import { GraphControllerContext } from './useGraphController'

export interface NodeDetailViewProps {
    results: EnrichedCard[];
    runSearch: (query: string) => Promise<void>
}

export function NodeDetailView({ results, runSearch }: NodeDetailViewProps) {
    const { selectedNode } = useContext(GraphControllerContext);
    switch (selectedNode.type) {
        case "search":
            return <SearchDetailView
                searchResults={results}
                runSearch={runSearch}
                searchNode={selectedNode as SearchNode}
            />
        case "card":
            return <CardDetailView
                cardNode={selectedNode as CardNode}
            />
    }
}