import React, { useContext, useState } from 'react'
import { GraphUserSettingsContext } from './userSettings'
import { GraphControllerContext } from './useGraphController'
import { Modal } from '../../component/modal'
import { TextEditor } from '../../component/editor/textEditor'
import { Card, QueryRunner } from 'mtgql'
import { COGDB_FILTER_PROVIDER } from '../../../api/local/db'
import { cardToCardNode, deserializeGraph, GraphNode, SearchNode } from './types'
import { useListImporter } from '../../../api/local/useListImporter'
import { Alert } from '../../component/alert/alert'
import { ARENA_FORMAT_PLACEHOLDER } from '../../../strings'
import { displayMessage } from '../../../error'
import { TaskStatus } from '../../../types'
import { LoaderText, TRIANGLES } from '../../component/loaders'
import { ProjectContext } from '../../../api/local/useProjectDao'

export type GraphImportSource = 'text' | 'json';
const GRAPH_IMPORT_SOURCES: GraphImportSource[] = ['text', 'json']

export interface GraphImportModalProps {
    open: boolean;
    onClose: () => void;
}

export function GraphImportModal({ open, onClose }: GraphImportModalProps) {
    const [error, setError] = useState<string>('')
    const [importStatus, setImportStatus] = useState<TaskStatus>('unstarted');
    const { uniqueCardNodes } = useContext(GraphUserSettingsContext);
    const { setGraphState, addNodes } = useContext(GraphControllerContext);
    const listImporter = useListImporter();
    const [importSource, setImportSource] = useState<GraphImportSource>('text');

    // text import
    const [cardText, setCardText] = useState<string>('');
    const [searchText, setSearchText] = useState<string>('');

    const { savedCards } = useContext(ProjectContext);

    const canSubmit = (() => {
        if (importStatus === 'loading') return false;
        switch (importSource) {
            case "text":
                return cardText.trim().length > 0 || searchText.trim().length > 0;
            case 'json':
                return false;
        }
    })();

    const handleImportClick = async () => {
        setError('');
        setImportStatus('loading');

        switch (importSource) {
            case "text":
                await attemptTextImport();
                break;
            case "json":
                break;
        }
    }

    const handleUseSavedCards = () => {
        const cardText: string[] = [];
        const searchText: string[] = [];

        for (const section of savedCards) {
            const queryLines = section.query.split('\n');
            if (queryLines.length === 1) {
                searchText.push(queryLines[0]);
            } else if (queryLines.length > 1) {
                for (let i = 1; i < queryLines.length; i++){
                    const line = queryLines[i]
                    searchText.push(`${queryLines[0]} (${queryLines[i]})`);
                }
            }

            cardText.push(...section.cards);
        }

        setCardText(cardText.join('\n'));
        setSearchText(searchText.join('\n'));
    }

    const onFileInput = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError('');
        setImportStatus('loading');
        attemptJSONImport(event.target.files[0])
    }

    return <Modal
      className="graph-import-modal"
      open={open}
      onClose={onClose}
      title={<div className="row baseline">
          <h2>Import from: </h2>
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
          {importStatus === 'loading' && <LoaderText text="" frames={TRIANGLES} />}
      </div>}
    >
        {importSource === 'text' && <div className='import-form'>
            <label>
                <div className="bold">cards</div>

                <TextEditor
                  language='arena-list'
                  placeholder={ARENA_FORMAT_PLACEHOLDER}
                  setQueries={(it: string[]) => setCardText(it.join('\n'))}
                  queries={cardText.split('\n')}
                  gutterColumns={[]}
                />
            </label>


            <label>
                <div className='bold'>searches</div>
                <TextEditor
                  language='mtgql'
                  placeholder='Enter one search per line.'
                  setQueries={(it: string[]) => setSearchText(it.join('\n'))}
                  queries={searchText.split('\n')}
                  gutterColumns={[]}
                />
            </label>

            <div className='row center'>
                <button onClick={handleUseSavedCards} disabled={importStatus === 'loading'}>use saved cards</button>
                <button onClick={handleImportClick} disabled={!canSubmit}>import</button>

            </div>
        </div>}
        {importSource === 'json' && <div>
            <p>valid format is a JSON file exported from graph search</p>
            <div className='file-input-root'>
                <label htmlFor='file-import'>
                    <div>
                        <p>click to browse files</p>

                        <p>or</p>

                        <p>drag a file here to import</p>
                    </div>
                </label>
                <input
                  id='file-import'
                  type='file'
                  accept='.json'
                  onChange={onFileInput}
                />
            </div>
        </div>}

        {error && <Alert>
            <pre><code>{error}</code></pre>
        </Alert>}

    </Modal>

    async function attemptTextImport() {
        try {
            const searches = searchText
              .split('\n')
              .filter(it => it.trim().length > 0)
            const searchFilters = await Promise.allSettled(
              searches.map(search => QueryRunner.singleCardFilter(search.trim(), COGDB_FILTER_PROVIDER))
            );

            const errors = searchFilters
              .map((res, index) => ({ res, index }))
              .filter(({res}) => res.status === 'rejected')
            if (errors.length > 0) {
                setError(errors.map(({ res, index }) => displayMessage((res as PromiseRejectedResult).reason, index)).join('\n'))
                setImportStatus('error');
                return;
            }

            const searchNodes: SearchNode[] = searches.map((search, index) => ({
                id: search,
                type: 'search',
                group: 's',
                filterFunc: (searchFilters[index] as PromiseFulfilledResult<(card: Card) => boolean>).value,
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
            setImportStatus('success');
            onClose();
        } catch (e) {
            setError(e.toString())
            setImportStatus('error');
        }
    }

    async function attemptJSONImport(file: File) {
        try {
            const content = await file.text();

            const graphState = await deserializeGraph(content);

            setGraphState(graphState);
            setImportStatus('success');
            onClose();
        } catch (e) {
            console.error(e);
            setError(e.toString());
            setImportStatus('error');
        }

    }
}

