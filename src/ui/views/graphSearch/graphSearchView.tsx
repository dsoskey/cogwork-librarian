import React, { useRef, useState } from 'react'
import { useGraphController } from './useGraphController'
import { NodeDetailView } from './nodeDetailView'
import { GraphView } from './graphView'
import { imageUris } from '../../../api/mtgjson'
import { CardNode, cardToCardNode, SearchNode } from './types'
import { NormedCard, QueryRunner } from 'mtgql'
import { cogDB, COGDB_FILTER_PROVIDER } from '../../../api/local/db'
import { CARD_INDEX } from '../../../api/local/cardIndex'
import "./graphSearchView.css";
import { Autocomplete } from '../../component/autocomplete'
import { useMemoryQueryRunner } from '../../../api/local/useQueryRunner'

export interface GraphSearchViewProps {
  memory: NormedCard[];
}

interface GraphSearchSettings {
  uniqueCardNodes: boolean;

}

const GRAPH_SETTINGS: GraphSearchSettings = {
  uniqueCardNodes: false,
}

export function GraphSearchView({ memory }: GraphSearchViewProps) {
  // todo: loading and error states
  const { result, run } = useMemoryQueryRunner({ corpus: memory });
  const [settings] = useState<GraphSearchSettings>(GRAPH_SETTINGS);

  const graphController = useGraphController({ initialLinks: [], initialNodes: [] });
  const {
    addNodes,
    selectedNode, setSelectedNode, toggleLink,
    links, nodes,
    hoverId, hoverName, hoverType, hoverStyle
  } = graphController;

  const autoCompleteRef = useRef<HTMLInputElement>();
  const [nextSearchText, setNextSearchText] = useState("");
  const handleNextSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNextSearchText(event.target.value);
  }
  const handleSearchKeydown = async (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        if (nextSearchText.trim() === "") return;

        try {
          const card = await cogDB.getCardByName(nextSearchText.trim());
          const cardNode: CardNode = cardToCardNode(card, settings.uniqueCardNodes ? 0 : nodes.current.length);
          graphController.addNode(cardNode);
          setNextSearchText('');
          autoCompleteRef.current?.focus();
        } catch (e) {
          try {
            const filterFunc = await QueryRunner.singleCardFilter(nextSearchText.trim(), COGDB_FILTER_PROVIDER);

            const searchNode: SearchNode = {
              id: nextSearchText,
              filterFunc,
              group: 's',
              type: 'search',
              size: 0,
              totalSize: 0,
            }
            graphController.addNode(searchNode);
            setNextSearchText('');
          } catch (e) {
            console.error(e);
          }
        }
    }
  }

  const handleCardSelect = async (cardName: string) => {
    try {
      const card = await cogDB.getCardByName(cardName);
      const cardNode: CardNode = cardToCardNode(card, nodes.current.length);
      graphController.addNode(cardNode);
      setNextSearchText('')
      autoCompleteRef.current?.focus();
    } catch (e) {
      console.error(e);
    }
  }

  const runSearch = async (search: string) => {
    await run([search], {
      prefer: 'oldest',
      order: 'cmc',
      unique: 'cards',
      dir: 'auto',
    },
    (it) => it,
      () => 1);
  }

  return <div className='graph-search-root'>
    <div className='controls-root'>
      <Autocomplete
        inputRef={autoCompleteRef}
        getCompletions={CARD_INDEX.handleAutocomplete}
        setValue={handleCardSelect}
        placeholder="enter a card name or search"
        value={nextSearchText}
        onChange={handleNextSearchTextChange}
        onKeyDown={handleSearchKeydown}
      />

      {/* todo: */}
      {/*<button>Import</button>*/}
      {/*<button>Export</button>*/}
    </div>

    <div className="row">
      <GraphView {...graphController} />
      <div className="detail-view-root">
        {selectedNode &&
          <NodeDetailView
            results={result}
            runSearch={runSearch}
            selectedNode={selectedNode}
            addNodes={addNodes}
            nodes={nodes}
            links={links}
            setSelectedNode={setSelectedNode}
            toggleLink={toggleLink}
          />
        }
      </div>
    </div>

    {/*todo: consider cenralized hover card rendering.*/}
    {hoverId && hoverType === 'card' &&
      <img
        className="card-image"
        src={imageUris(hoverId, "front").normal}
        width={250}
        style={hoverStyle}
        alt={hoverName}
      />}
    {hoverId && hoverType === 'search' && <div style={{
      ...hoverStyle,
      padding: '4px',
      borderRadius: '4px',
      background: '#343434'
    }}><code>{hoverName}</code></div>}
  </div>;
}

