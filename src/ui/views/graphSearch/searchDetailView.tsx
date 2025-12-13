import React, { useContext, useEffect, useMemo, useRef } from 'react'
import {
    type CardNode, cardToCardNode,
    relatedNodeIds,
    type SearchNode
} from './types'
import { RelatedCard, RelatedCardList } from './relatedCardList'
import {RelatedSearchList} from "./relatedSearchList";
import { EnrichedCard } from '../../../api/queryRunnerCommon'
import { PageControl, PageInfo, usePageControl } from '../../cardBrowser/pageControl'
import { useLocalStorage } from '../../../api/local/useLocalStorage'
import { PAGE_SIZE } from '../../cardBrowser/constants'
import { GraphControllerContext } from './useGraphController'
import { CogDBContext } from '../../../api/local/useCogDB'
import { GraphUserSettingsContext } from './userSettings'
import { TrashIcon } from '../../icons/trash'
import { LoaderText } from '../../component/loaders'
import { Setter } from '../../../types'

export interface SearchDetailViewProps {
    searchNode: SearchNode;
    searchResults: EnrichedCard[];
    runSearch: (query: string) => Promise<void>;
}

export function SearchDetailView({ searchNode, searchResults, runSearch }: SearchDetailViewProps) {
    const { id } = searchNode;
    const headerRef = useRef<HTMLElement>();
    const eocListRef = useRef<HTMLElement>();
    const { memStatus } = useContext(CogDBContext);
    const {
        links, nodes,
        setSelectedNode, toggleLink, addNodes, removeNode,
    } = useContext(GraphControllerContext);
    const handleDeleteClick = () => removeNode(id);

    const { uniqueCardNodes } = useContext(GraphUserSettingsContext)

    const [pageSize] = useLocalStorage('page-size', PAGE_SIZE)
    const { pageNumber, setPageNumber, lowerBound, upperBound } = usePageControl(pageSize, 0)
    const _setPageNumber: Setter<number> = (p) => {
        setPageNumber(p);

        const scroll = document.documentElement.scrollTop;
        if (eocListRef.current) {
            eocListRef.current.scrollIntoView({ container: 'nearest' });
        } else {
            headerRef.current.scrollIntoView({ container: 'nearest' });
        }
        document.documentElement.scroll(0,scroll);
    }

    const { relatedCardSet, relatedCards, relatedSearches } = useMemo(() => {
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
        const relatedCardSet = new Set(relatedCards.map(it => it.card.name));

        return { relatedSearches, relatedCards, relatedCardSet };
    }, [searchNode]);

    const filteredResults = useMemo(() => searchResults
      .filter(it => !relatedCardSet.has(it.data.name)), [searchResults, relatedCardSet])
    const currentPage = useMemo(
      () => {
          return filteredResults
            .slice(lowerBound, upperBound)
      },
      [filteredResults, lowerBound, upperBound]);

    useEffect(() => {
        runSearch(id);
    }, [id, memStatus]);
    useEffect(() => {
        setPageNumber(0)
    }, [searchResults]);

    const onAddAllClick = () => {
        addNodes(searchResults.map(((it, index) =>
          cardToCardNode(it.data, uniqueCardNodes ? 0 : index + nodes.current.length))));
    }

    return <section className="search-detail-view">
        <div ref={headerRef}></div>
        <div className="detail-view-header row center">
            <h2><code>{id}</code></h2>
            <button onClick={handleDeleteClick}><TrashIcon /></button>
        </div>

        {relatedSearches.length > 0 && <RelatedSearchList
          relatedSearches={relatedSearches}
          setSelectedNode={setSelectedNode}
          toggleLink={(t) => toggleLink(id, t)}
        />}

        {relatedCards.length > 0 && <RelatedCardList
          relatedCards={relatedCards}
          setSelectedNode={setSelectedNode}
          headerRef={headerRef}
          endOfCardListRef={eocListRef}
        />}

        {memStatus === 'loading' && <h3><LoaderText text="Loading search" /></h3>}
        {memStatus === "success" && <>
            <div className='related-header'>
                <div className="row center">
                    <h3>{filteredResults.length === 0 && 'No '}other cards in search</h3>
                    {filteredResults.length > 0 && <button onClick={onAddAllClick}>add all</button>}
                </div>
                {filteredResults.length > pageSize && <div className='row center wrap'>
                    <PageInfo
                      searchCount={filteredResults.length}
                      ignoreCount={0}
                      lowerBound={lowerBound + 1}
                      upperBound={upperBound}
                    />
                    <PageControl
                      pageNumber={pageNumber}
                      setPageNumber={_setPageNumber}
                      pageSize={pageSize}
                      upperBound={upperBound}
                      count={filteredResults.length}
                    />
                </div>}
            </div>
            {filteredResults.length > 0 && <ul>
                {currentPage.map(({ data }, index) => <RelatedCard
                  key={data.id}
                  card={data}
                  onCardClick={() => addNodes([
                      cardToCardNode(data, uniqueCardNodes ? 0 : index + nodes.current.length)
                  ])}
                />)}
            </ul>}
        </>}
    </section>;
}

