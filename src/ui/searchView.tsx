import { QueryForm } from './queryForm/queryForm'
import { BrowserView } from './cardBrowser/browserView'
import React, { useContext, useState } from 'react'
import { ProjectContext } from '../api/useProject'
import { useLocalStorage } from '../api/local/useLocalStorage'
import { DataSource } from '../types'
import { useMemoryQueryRunner } from '../api/local/useQueryRunner'
import { useScryfallQueryRunner } from '../api/scryfall/useQueryRunner'
import { CogDBContext } from '../api/local/useCogDB'
import { SavedCards } from './savedCards'
import { Masthead } from './component/masthead'
import { Footer } from './footer'
import { parseQuerySet, RunStrategy } from '../api/scryfallExtendedParser'
import { CogError } from '../error'
import { INTRO_EXAMPLE } from '../api/example'
import { SearchOptions } from '../api/mql/types/searchOptions'
import { cogDB as cogDBClient } from '../api/local/db'

const options: SearchOptions = {
  order: 'cmc',
  dir: 'auto',
}
export const SearchView = () => {
  const cogDB = useContext(CogDBContext)

  const { addIgnoredId, addCard, savedCards, ignoredIds, setSavedCards } = useContext(ProjectContext)
  const [rawQueries, setRawQueries] = useLocalStorage<string[]>('queries', INTRO_EXAMPLE)

  const [source, setSource] = useLocalStorage<DataSource>('source', 'local')
  const queryRunner = {
    local: useMemoryQueryRunner({ corpus: cogDB.memory }),
    scryfall: useScryfallQueryRunner({}),
  }[source]
  const [extendedParseError, setExtendedParseError] = useState<CogError[]>([])
  const errorsToDisplay = extendedParseError.length > 0 ? extendedParseError : queryRunner.errors

  const [showSavedCards, setShowSavedCards] = useLocalStorage<boolean>("showSavedCards", true)

  const execute = (baseIndex: number) => {
    console.debug(`submitting query at line ${baseIndex}`)
    if (baseIndex < 0 || baseIndex >= rawQueries.length) {
      console.error("baseIndex is out of bounds")
      return
    }
    setExtendedParseError([])

    parseQuerySet(rawQueries, baseIndex)
      .map(({ strategy, queries, getWeight, injectPrefix }) => {
        const executedAt = new Date();
        let promise
        if (strategy === RunStrategy.Venn && queryRunner.generateVenn !== undefined) {
          const [left, right, ...rest] = queries
          promise = queryRunner.generateVenn(left, right, rest, options, getWeight)
        } else {
          promise = queryRunner.run(queries, options, injectPrefix, getWeight)
        }
        promise.then(() =>
            cogDBClient.history.put({
              rawQueries,
              baseIndex,
              source,
              strategy,
              executedAt,
            })
          ).catch(error => {
            console.error(error)
            cogDBClient.history.put({
              rawQueries,
              baseIndex,
              source,
              strategy,
              errorText: error.toString(),
              executedAt,
            })
          })
      })
      .mapErr(it => setExtendedParseError([it]))
  }

  return<div className='search-view-root'>
    <div className='query-panel'>
      <div className='row'>
        <Masthead />
        <div className='saved-cards-toggle'>
          <button onClick={() => setShowSavedCards(prev => !prev)}>
            {showSavedCards ? "hide": "show"} saved cards
          </button>
        </div>
      </div>
      <QueryForm
        status={queryRunner.status}
        execute={execute}
        queries={rawQueries}
        setQueries={setRawQueries}
        source={source}
        setSource={setSource}
      />
      <BrowserView
        report={queryRunner.report}
        result={queryRunner.result}
        status={queryRunner.status}
        errors={errorsToDisplay}
        addCard={addCard}
        addIgnoredId={addIgnoredId}
        ignoredIds={ignoredIds}
        source={source}
        runStrategy={queryRunner.runStrategy ?? RunStrategy.Search}
      />
      <Footer />
    </div>

    {<div className={`saved-cards-floater ${showSavedCards ? "show" : "hide"}`}>
      {showSavedCards && <SavedCards savedCards={savedCards} setSavedCards={setSavedCards} />}
    </div>}
  </div>;
}