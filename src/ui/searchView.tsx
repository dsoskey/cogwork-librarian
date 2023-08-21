import { QueryForm } from './queryForm/queryForm'
import { SearchError } from './component/searchError'
import { BrowserView } from './cardBrowser/browserView'
import React, { useContext, useState } from 'react'
import { ProjectContext } from '../api/useProject'
import { injectPrefix as _injectPrefix, QueryRunner, weightAlgorithms } from '../api/queryRunnerCommon'
import { useQueryForm } from './queryForm/useQueryForm'
import { INTRO_EXAMPLE } from './docs/introExample'
import { FlagContext } from '../flags'
import { useLocalStorage } from '../api/local/useLocalStorage'
import { DataSource, Setter } from '../types'
import { useViewportListener } from '../viewport'
import { useMemoryQueryRunner } from '../api/local/useQueryRunner'
import { useScryfallQueryRunner } from '../api/scryfall/useQueryRunner'
import { CogDBContext } from '../api/local/useCogDB'

interface SearchViewProps {
  source: DataSource
  setSource: Setter<DataSource>
  queryRunner: QueryRunner
}

export const SearchView = () => {
  const { multiQuery } = useContext(FlagContext).flags
  const viewport = useViewportListener()

  const cogDB = useContext(CogDBContext)

  const { addIgnoredId, addCard, savedCards, ignoredIds, setSavedCards } = useContext(ProjectContext)
  const { queries, setQueries, options, setOptions } = useQueryForm({
    example: () => INTRO_EXAMPLE,
  })
  const [source, setSource] = useLocalStorage<DataSource>('source', 'scryfall')
  const queryRunner = {
    local: useMemoryQueryRunner({
      getWeight: weightAlgorithms.zipf,
      corpus: cogDB.memory,
    }),
    scryfall: useScryfallQueryRunner({
      getWeight: weightAlgorithms.zipf,
    }),
  }[source]


  const [showCogLib, setShowCogLib] = useState<boolean>(true)
  const [lockCogLib, setLockCogLib] = useLocalStorage<boolean>('lock-coglib', false)

  const toggle = <div className='toggle'>
    <button
      onClick={() => setLockCogLib(prev => !prev)}
      title={`${lockCogLib ? "unlock":"lock"} controls`}>{lockCogLib ? "🔒":"🔓"}
    </button>
    {queryRunner.status !== 'unstarted' && <button
      onClick={() => setShowCogLib(prev => !prev)}
      title={`${showCogLib ? "close":"open"} controls`}
    >
      {viewport.mobile ? (showCogLib ? "^" : "v") : (showCogLib ? "<<":">>")}
    </button>}
  </div>

  const execute = (baseIndex: number) => {
    console.debug(`submitting query at line ${baseIndex}`)
    if (baseIndex < 0 || baseIndex >= queries.length) {
      console.error("baseIndex is out of bounds")
      return
    }
    let toSubmit: string[] = []
    if (multiQuery) {
      let currentIndex = baseIndex
      while (currentIndex < queries.length && queries[currentIndex].trim() !== "") {
        if (!queries[currentIndex].trimStart().startsWith("#")) {
          toSubmit.push(queries[currentIndex])
        }
        currentIndex++
      }
      console.debug(toSubmit)
    } else {
      toSubmit = queries
    }

    if (toSubmit.length === 0) {
      console.warn(`empty query for base query at index ${baseIndex}`)
    } else {
      const [base, ...sub] = toSubmit
      //setSubmittedQuery(toSubmit)
      queryRunner.run(sub, options, _injectPrefix(base))
        .then(() => {
          if (!lockCogLib) {
            setShowCogLib(false)
          }
        })
        .catch(error => {
          console.error(error)
        })
    }
  }

  return <div className='cumbo'>
    <div className={`search-root cogwork-librarian ${showCogLib ? "show": "hide"}`}>
      <QueryForm
        status={queryRunner.status}
        execute={execute}
        queries={queries}
        setQueries={setQueries}
        options={options}
        setOptions={setOptions}
        source={source}
        setSource={setSource}
      />

      {queryRunner.status === 'error' && <SearchError
        report={queryRunner.report}
        errors={queryRunner.errors}
        source={source}
      />}
    </div>
    <div className='row'>
      <BrowserView
        report={queryRunner.report}
        result={queryRunner.result}
        status={queryRunner.status}
        errors={queryRunner.errors}
        addCard={addCard}
        addIgnoredId={addIgnoredId}
        ignoredIds={ignoredIds}
        source={source}
        lockCoglib={lockCogLib}
        openCoglib={() => setShowCogLib(true)}
      />
      {<div className='saved-cards-floater'>
        {/*<SavedCards savedCards={project.savedCards} setSavedCards={project.setSavedCards} />*/}
      </div>}
    </div>
  </div>
}