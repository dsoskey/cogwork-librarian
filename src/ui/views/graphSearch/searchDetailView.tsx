import React, { useEffect, useMemo } from 'react'
import {
    type CardNode, cardToCardNode,
    type GraphLink,
    type GraphNode,
    relatedNodeIds,
    type SearchNode
} from './types'
import {RelatedCardList} from "./relatedCardList";
import {RelatedSearchList} from "./relatedSearchList";
import { EnrichedCard } from '../../../api/queryRunnerCommon'
import { CardLink } from './cardLink'
import { PageControl, PageInfo, usePageControl } from '../../cardBrowser/pageControl'
import { useLocalStorage } from '../../../api/local/useLocalStorage'
import { PAGE_SIZE } from '../../cardBrowser/constants'

export interface SearchDetailViewProps {
    searchNode: SearchNode;
    links: React.RefObject<GraphLink[]>;
    nodes: React.RefObject<GraphNode[]>;
    setSelectedNode: (node: GraphNode) => void;
    toggleLink: (source: string, target: string) => void;
    searchResults: EnrichedCard[];
    runSearch: (query: string) => Promise<void>;
    addNodes: (nodes: GraphNode[]) => void;
}

export function SearchDetailView({ addNodes, searchNode, links, nodes, setSelectedNode, toggleLink, searchResults, runSearch }: SearchDetailViewProps) {
    const { id } = searchNode;

    const [pageSize] = useLocalStorage('page-size', PAGE_SIZE)
    const { pageNumber, setPageNumber, lowerBound, upperBound } = usePageControl(pageSize, 0)
    const currentPage = useMemo(
      () => searchResults.slice(lowerBound, upperBound),
      [searchResults, lowerBound, upperBound]
    )

    const { relatedCards, relatedSearches } = useMemo(() => {
        const relatedSearches: SearchNode[] = [];
        const relatedCards: CardNode[] = [];

        const relatedLinks = relatedNodeIds(links.current, id);
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
    }, [searchNode]);

    useEffect(() => {
        runSearch(id);
    }, [id]);
    useEffect(() => {
        setPageNumber(0)
    }, [searchResults]);

    const onAddAllClick = () => {
        addNodes(searchResults.map(((it, index) =>
          cardToCardNode(it.data,  true ? 0 : index + nodes.current.length))));
    }

    return <section>
        <h2><code>{id}</code></h2>

        {relatedSearches.length > 0 && <RelatedSearchList
          relatedSearches={relatedSearches}
          setSelectedNode={setSelectedNode}
          toggleLink={(t) => toggleLink(id, t)}
        />}

        {relatedCards.length > 0 && <RelatedCardList
          relatedCards={relatedCards}
          setSelectedNode={setSelectedNode}
        />}

        {searchResults.length > 0 && <>
            <div className="row center">
                <h3>search results</h3>
                <button onClick={onAddAllClick}>add all</button>
            </div>
            <div className='row center wrap'>
                <PageInfo
                  searchCount={searchResults.length}
                  ignoreCount={0}
                  lowerBound={lowerBound + 1}
                  upperBound={upperBound}
                />
                <PageControl
                  pageNumber={pageNumber}
                  setPageNumber={setPageNumber}
                  pageSize={pageSize}
                  upperBound={upperBound}
                  count={searchResults.length}
                />
            </div>
            <ul>
                {currentPage.map(({ data }) => <li className='related' key={data.id}>
                    <CardLink
                      name={data.name}
                      id={data.id}

                    />
                </li>)}
            </ul>
        </>}
    </section>;
}

