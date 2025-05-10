import { QueryForm } from './queryForm/queryForm'
import { BrowserView } from './cardBrowser/browserView'
import React, { useCallback, useEffect, useState } from 'react'
import { Setter } from '../types'
import { useMemoryQueryRunner } from '../api/local/useQueryRunner'
import { Masthead } from './component/masthead'
import { Footer } from './footer'
import { parseQuerySet } from '../api/mtgql-ep/parser'
import { CogError } from '../error'
import { cogDB as cogDBClient } from '../api/local/db'
import { RunStrategy } from '../api/queryRunnerCommon'
import { SearchOptionPicker, useSearchOptions } from './settingsView'
import { GearIcon } from './icons/gear'
import { Modal } from './component/modal'
import { Card, NormedCard } from 'mtgql'

export interface SearchViewProps {
  showSavedCards: boolean;
  setShowSavedCards: Setter<boolean>;
  path: string;
  addCard: (query: string, card: Card) => void;
  queries: string[]
  setQueries: Setter<string[]>;
  toggleIgnoreId: (id: string) => void;
  ignoredIds: string[]
  memory: NormedCard[]
}
export const SearchView = ({
  showSavedCards, setShowSavedCards,
  memory,
  path, addCard, queries, setQueries, toggleIgnoreId, ignoredIds
}: SearchViewProps) => {

  const [options, setters] = useSearchOptions();
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { result, report, status, runStrategy, errors, generateVenn,run } = useMemoryQueryRunner({ corpus: memory });
  const [extendedParseError, setExtendedParseError] = useState<CogError[]>([])
  const errorsToDisplay = extendedParseError.length > 0 ? extendedParseError : errors
  const [lastQueries, setLastQueries] = useState<string[]>([])


  const execute = useCallback((baseIndex: number, selectedIndex: number) => {
    console.debug(`submitting query at line ${baseIndex}`)
    if (baseIndex < 0 || baseIndex >= queries.length) {
      console.error("baseIndex is out of bounds")
      return
    }
    setExtendedParseError([])

    try {
      const querySet = parseQuerySet(queries, baseIndex, selectedIndex);
      const { strategy, getWeight, injectPrefix } = querySet;
      const executedAt = new Date();
      let promise: Promise<void>
      if (strategy === RunStrategy.Venn && generateVenn !== undefined) {
        const [left, right, ...rest] = querySet.queries
        promise = generateVenn(left, right, rest, options, getWeight)
      } else {
        promise = run(querySet.queries, options, injectPrefix, getWeight)
      }
      setLastQueries(querySet.rawQueries);
      promise.then(() =>
        cogDBClient.history.put({
          rawQueries: querySet.queries,
          baseIndex,
          source: 'local',
          strategy,
          executedAt,
          projectPath: path,
        })
      ).catch(error => {
        console.error(error)
        cogDBClient.history.put({
          rawQueries: querySet.queries,
          baseIndex,
          source: 'local',
          strategy,
          errorText: error.toString(),
          executedAt,
          projectPath: path,
        })
      })
    } catch (error) {
      setExtendedParseError([error])
    }
  }, [queries, run, generateVenn, setLastQueries, path, setExtendedParseError, options]);

  useEffect(() => {
    const handleFocusShortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "'") {
        const element = document.querySelector(".text-editor-root .controller");
        element?.focus?.()
      }
    }
    document.addEventListener("keydown", handleFocusShortcut)
    return () => document.removeEventListener("keydown", handleFocusShortcut)
  }, [])

  const handleSettingsClick = useCallback(() => setSettingsOpen(true), [setSettingsOpen]);

  return <>
    <div className='query-panel'>
      <div className='row top'>
        <Masthead />
        <button className='saved-cards-toggle' onClick={() => setShowSavedCards(prev => !prev)}>
          {showSavedCards ? "hide" : "show"} saved cards
        </button>
      </div>
      <QueryForm
        queries={queries}
        setQueries={setQueries}
        status={status}
        execute={execute}
        settingsButton={<button
          className='rotate-on-hover'
          title="search settings"
          onClick={handleSettingsClick}>
        <GearIcon className="rotate-target" />
      </button>}
      />
      <BrowserView
        lastQueries={lastQueries}
        report={report}
        result={result}
        status={status}
        errors={errorsToDisplay}
        addCard={addCard}
        addIgnoredId={toggleIgnoreId}
        ignoredIds={ignoredIds}
        source="local"
        runStrategy={runStrategy ?? RunStrategy.Search}
      />
      <Footer />
    </div>
    {settingsOpen && <Modal
      open={settingsOpen}
      onClose={() => setSettingsOpen(false)}
      title={<h2 className="row center">
        <span>Search settings</span>
        <GearIcon size="32" />
      </h2>}
    >
      <SearchOptionPicker options={options} {...setters} />
    </Modal>}
  </>;
}