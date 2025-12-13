import React, { useEffect, useRef, useState } from 'react'
import { GraphControllerContext, useGraphController } from './useGraphController'
import { NodeDetailView } from './nodeDetailView'
import { GraphView } from './graphView'
import { CardNode, cardToCardNode, deserializeGraph, SearchNode, serializeGraph } from './types'
import { NormedCard, QueryRunner, SearchError } from 'mtgql'
import { cogDB, COGDB_FILTER_PROVIDER } from '../../../api/local/db'
import { CARD_INDEX } from '../../../api/local/cardIndex'
import './graphSearchView.css'
import { Autocomplete } from '../../component/autocomplete'
import { useMemoryQueryRunner } from '../../../api/local/useQueryRunner'
import { DEFAULT_GRAPH_USER_SETTINGS, GraphUserSettings, GraphUserSettingsContext } from './userSettings'
import { GraphImportModal } from './importModal'
import { HoverCard } from '../../component/hoverCard'
import { Alert } from '../../component/alert/alert'
import { TaskStatus } from '../../../types'
import { displayMessage } from '../../../error'
import { downloadText } from '../../download'

export interface GraphSearchViewProps {
  memory: NormedCard[];
}

export function GraphSearchView({ memory }: GraphSearchViewProps) {
  const { result, run } = useMemoryQueryRunner({ corpus: memory });
  const [graphStatus, setGraphStatus] = useState<TaskStatus>('loading');
  const [settings] = useState<GraphUserSettings>(DEFAULT_GRAPH_USER_SETTINGS);
  const [activeModal, setActiveModal] = useState<'import' | 'export' | 'settings' | undefined>();
  const closeModal = () => {
    setActiveModal(undefined)
  }

  const graphController = useGraphController({ initialLinks: [], initialNodes: [] })
  const {
    selectedNode, nodes, links,
    graphError, setGraphError,
    hoverId, hoverName, hoverType, hoverStyle
  } = graphController;
  const handleExportClick = () => {
    downloadText(
      serializeGraph({ nodes: nodes.current, links: links.current }, true),
      `coglib-graph-${Date.now()}`,
      'json',
    )
  }
  const autoCompleteRef = useRef<HTMLInputElement>();
  const [nextSearchText, setNextSearchText] = useState("");
  const handleNextSearchTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNextSearchText(event.target.value);
  }
  const handleSearchKeydown = async (event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Enter':
        if (nextSearchText.trim() === "") return;
        setGraphError('')

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
            autoCompleteRef.current?.focus();
          } catch (e) {
            console.error(e);
            const error = e as SearchError;
            setGraphError(displayMessage(error, 0))
            autoCompleteRef.current?.blur();
          }
        }
    }
  }

  const handleCardSelect = async (cardName: string) => {
    try {
      const card = await cogDB.getCardByName(cardName);
      const cardNode: CardNode = cardToCardNode(card, settings.uniqueCardNodes ? 0 : nodes.current.length);
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

  useEffect(() => {
    (async () => {
      setGraphStatus('loading');
      const localState = localStorage.getItem('graph-search.state')
      if (localState) {
        try {
          const nextState = await deserializeGraph(localState);
          graphController.setGraphState(nextState);
          setGraphStatus('success');
        } catch (e) {
          setGraphStatus('error');
          setGraphError(e.toString());
        }

      }

    })()
  }, [])

  return <GraphControllerContext.Provider value={graphController}>
    <GraphUserSettingsContext.Provider value={settings}>
      <div className='graph-search-root'>
        <div className='controls-root'>
          <div className='row center'>
            <Autocomplete
              disabled={graphStatus === 'loading'}
              inputRef={autoCompleteRef}
              getCompletions={CARD_INDEX.handleAutocomplete}
              setValue={handleCardSelect}
              placeholder='enter a card name or search'
              value={nextSearchText}
              onChange={handleNextSearchTextChange}
              onKeyDown={handleSearchKeydown}
            />

            <button disabled={graphStatus === 'loading'} onClick={() => setActiveModal("import")}>Import</button>
            <button disabled={graphStatus === 'loading'} onClick={handleExportClick}>Export</button>
            {/*<button>Settings</button>*/}
          </div>

          {graphError && <Alert dismiss={() => setGraphError('')} ><pre><code>{graphError}</code></pre></Alert> }
        </div>

        <div className='row'>
          <GraphView {...graphController} graphStatus={graphStatus} />
          <div className='detail-view-root'>
            {selectedNode &&
              <NodeDetailView
                results={result}
                runSearch={runSearch}
              />
            }
          </div>
        </div>

        {hoverId && hoverType === 'card' &&
          <HoverCard cardName={hoverName} id={hoverId} hoverStyle={hoverStyle} />
        }
        {hoverId && hoverType === 'search' && <div style={{
          ...hoverStyle,
          padding: 'var(--spacing-200)',
          borderRadius: 'var(--border-radius)',
          background: 'var(--darker-color)'
        }}><code>{hoverName}</code></div>}
      </div>

      <GraphImportModal open={activeModal === 'import'} onClose={closeModal} />
    </GraphUserSettingsContext.Provider>
  </GraphControllerContext.Provider>
}