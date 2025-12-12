import React, { useContext, useState } from 'react'
import { GraphUserSettingsContext } from './userSettings'
import { GraphControllerContext } from './useGraphController'
import { Modal } from '../../component/modal'
import { TextEditor } from '../../component/editor/textEditor'
import { QueryRunner } from 'mtgql'
import { COGDB_FILTER_PROVIDER } from '../../../api/local/db'
import { cardToCardNode, GraphNode, SearchNode } from './types'
import { useListImporter } from '../../../api/local/useListImporter'
import { Alert } from '../../component/alert/alert'

export type GraphImportSource = 'text' | 'json' | 'saved cards';
const GRAPH_IMPORT_SOURCES: GraphImportSource[] = ['text', 'json', 'saved cards']

export interface GraphImportModalProps {
    open: boolean;
    onClose: () => void;
}

export function GraphImportModal({ open, onClose }: GraphImportModalProps) {
    const [error, setError] = useState<string>('')
    const { uniqueCardNodes } = useContext(GraphUserSettingsContext);
    const { setGraphState, addNodes } = useContext(GraphControllerContext);
    const listImporter = useListImporter();
    const [importSource, setImportSource] = useState<GraphImportSource>('text');

    // text import
    const [cardText, setCardText] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('');

    // saved cards import
    // const { savedCards } = useContext(ProjectContext);

    const canSubmit = (() => {
        switch (importSource) {
            case "text":
                return cardText.trim().length > 0 || searchText.trim().length > 0;
            case "saved cards":
                return false;
            case 'json':
                return false;
        }
    })();

    const handleImportClick = async () => {
        switch (importSource) {
            case "text":
                await attemptTextImport();
                break;
            case "json":
                break;
            case "saved cards":
                break;

        }
    }

    return <Modal
      open={open}
      onClose={onClose}
      title={<div className="row baseline">
          <h2>import from </h2>
          {GRAPH_IMPORT_SOURCES.map(source => <label
            className={`input-link ${source === importSource ? "active-link" : ""}`}
          >
              <input
                type='radio'
                value={source}
                checked={source === importSource}
                onChange={() => setImportSource(source)}
              />
              {source}
          </label>)}
      </div>}
    >
        {/* todo: minimum editor size 5*/}
        {importSource === 'text' && <div>
            <label>cards</label>
            <TextEditor
              language='arena-list'
              setQueries={(it: string[]) => setCardText(it.join('\n'))}
              queries={cardText.split('\n')}
              gutterColumns={[]}
            />

            <div>searches</div>
            <TextEditor
              language="mtgql"
              setQueries={(it: string[]) => setSearchText(it.join('\n'))}
              queries={searchText.split('\n')}
              gutterColumns={[]}
            />

        </div>}
        {importSource === 'json' && <div>coming soon</div>}
        {importSource === 'saved cards' && <div>coming soon</div>}

        {error && <Alert>{error}</Alert>}
        <button onClick={handleImportClick} disabled={!canSubmit}>import</button>
    </Modal>

    async function attemptTextImport() {
        try {
            const searches = searchText
              .split('\n')
              .filter(it => it.trim().length > 0)
            const searchFilters = await Promise.all(
              searches.map(search => QueryRunner.singleCardFilter(search.trim(), COGDB_FILTER_PROVIDER))
            );
            const searchNodes: SearchNode[] = searches.map((search, index) => ({
                id: search,
                type: 'search',
                group: 's',
                filterFunc: searchFilters[index],
                size: 0,
                totalSize: 0,
            }));

            const cards = await listImporter.attemptImport(
              cardText
              .split('\n')
              .filter(card => card.trim().length > 0)
              , false
            )
            const cardNodes = cards
              .map((card, index) => cardToCardNode(card, uniqueCardNodes ? 0 : index));


            setGraphState({ links: [], nodes: [] });
            addNodes((searchNodes as GraphNode[]).concat(cardNodes));
            onClose();
        } catch (e) {
            setError(e.toString())
        }
    }
}

