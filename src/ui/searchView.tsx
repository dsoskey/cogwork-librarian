import { QueryForm } from './queryForm/queryForm'
import { BrowserView } from './cardBrowser/browserView'
import React, { useContext, useState } from 'react'
import { ProjectContext } from '../api/local/useProjectDao'
import { useLocalStorage } from '../api/local/useLocalStorage'
import { DataSource } from '../types'
import { useMemoryQueryRunner } from '../api/local/useQueryRunner'
import { useScryfallQueryRunner } from '../api/scryfall/useQueryRunner'
import { CogDBContext } from '../api/local/useCogDB'
import { SavedCardsEditor } from './savedCards'
import { Masthead } from './component/masthead'
import { Footer } from './footer'
import { parseQuerySet } from '../api/mtgql-ep/parser'
import { CogError } from '../error'
import { SearchOptions } from 'mtgql'
import { cogDB as cogDBClient } from '../api/local/db'
import { RunStrategy } from '../api/queryRunnerCommon'

const options: SearchOptions = {
  order: 'cmc',
  dir: 'auto',
}

export const SearchView = () => {
  const cogDB = useContext(CogDBContext)
  const project = useContext(ProjectContext)
  const { queries, addCard } = project

  const [source, setSource] = useLocalStorage<DataSource>('source', 'local')
  const queryRunner = {
    local: useMemoryQueryRunner({ corpus: cogDB.memory }),
    scryfall: useScryfallQueryRunner({}),
  }[source]
  const [extendedParseError, setExtendedParseError] = useState<CogError[]>([])
  const errorsToDisplay = extendedParseError.length > 0 ? extendedParseError : queryRunner.errors

  const [showSavedCards, setShowSavedCards] = useLocalStorage<boolean>("showSavedCards", true)

  const execute = (baseIndex: number, selectedIndex: number) => {
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
      if (strategy === RunStrategy.Venn && queryRunner.generateVenn !== undefined) {
        const [left, right, ...rest] = queries
        promise = queryRunner.generateVenn(left, right, rest, options, getWeight)
      } else {
        promise = queryRunner.run(querySet.queries, options, injectPrefix, getWeight)
      }
      promise.then(() =>
        cogDBClient.history.put({
          rawQueries: querySet.queries,
          baseIndex,
          source,
          strategy,
          executedAt,
          projectPath: project.path,
        })
      ).catch(error => {
        console.error(error)
        cogDBClient.history.put({
          rawQueries: querySet.queries,
          baseIndex,
          source,
          strategy,
          errorText: error.toString(),
          executedAt,
          projectPath: project.path,
        })
      })
    } catch (error) {
      setExtendedParseError([error])
    }
  }

  return<div className='search-view-root'>
    <div className='query-panel'>
      <div className='row top'>
        <Masthead />
          <button className='saved-cards-toggle' onClick={() => setShowSavedCards(prev => !prev)}>
            {showSavedCards ? "hide": "show"} saved cards
          </button>
      </div>
      <QueryForm
        status={queryRunner.status}
        execute={execute}
        source={source}
        setSource={setSource}
      />
      <BrowserView
        report={queryRunner.report}
        result={queryRunner.result}
        status={queryRunner.status}
        errors={errorsToDisplay}
        addCard={addCard}
        addIgnoredId={project.toggleIgnoreId}
        ignoredIds={project.ignoredIds}
        source={source}
        runStrategy={queryRunner.runStrategy ?? RunStrategy.Search}
      />
      <Footer />
    </div>

    {<div className={`saved-cards-floater ${showSavedCards ? "show" : "hide"}`}>
      {showSavedCards && <SavedCardsEditor {...project} />}
    </div>}
  </div>;
}