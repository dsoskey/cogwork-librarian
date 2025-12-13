import React from "react";
import type { GraphNode, SearchNode } from "./types";

export interface RelatedSearchListProps {
    relatedSearches: SearchNode[];
    setSelectedNode: (node: GraphNode) => void;
    toggleLink?: (target: string) => void;
}

export function RelatedSearchList({ relatedSearches, setSelectedNode, toggleLink }: RelatedSearchListProps) {
    return <>
        <h3>related searches ({relatedSearches.length})</h3>
        <ul>
            {relatedSearches.map(rs => <li className="related" key={rs.id}>
                <pre><code className="language-mtgql" onClick={() => setSelectedNode(rs)}>{rs.id}</code></pre>
                {toggleLink && <button onClick={() => toggleLink(rs.id)}>X</button>}
            </li>)}
        </ul>
    </>;
}

