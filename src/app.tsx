import React, { useCallback } from 'react'
import { BrowserView } from './ui/cardBrowser/browserView'
import { useCogDB } from './api/local/useCogDB'
import { QueryForm } from './ui/queryForm/queryForm'
import { useScryfallQueryRunner } from './api/scryfall/useQueryRunner'
import { DataSource } from './types'
import { useQueryForm } from './ui/queryForm/useQueryForm'
import {
  weightAlgorithms,
  injectPrefix as _injectPrefix,
} from './api/queryRunnerCommon'
import { useLocalStorage } from './api/local/useLocalStorage'
import { useMemoryQueryRunner } from './api/memory/useQueryRunner'
import { useProject } from './api/useProject'
import { Footer } from './ui/footer'
import { useViewportListener } from './viewport'
import { SavedCards } from './ui/savedCards'
import { DatabaseSettings } from './ui/queryForm/databaseSettings'
import { CoglibIcon } from './api/memory/coglibIcon'
import { queryExamples } from './api/example'
import _random from 'lodash/random'

export const App = () => {
  const {
    saveToDB,
    dbStatus,
    memStatus,
    memory,
    setMemory,
    manifest,
    setManifest,
  } = useCogDB()
  const viewport = useViewportListener()
  const [source, setSource] = useLocalStorage<DataSource>('source', 'scryfall')

  const { addIgnoredId, ignoredIds, addCard, setSavedCards, savedCards } =
    useProject()

  const { queries, setQueries, options, setOptions } = useQueryForm({
    example: () => queryExamples[_random(queryExamples.length - 1)],
  })
  const [prefix, ...subQueries] = queries
  const injectPrefix = useCallback(_injectPrefix(prefix), [prefix])

  const queryRunner = {
    local: useMemoryQueryRunner({
      getWeight: weightAlgorithms.zipf,
      corpus: memory,
      injectPrefix,
    }),
    scryfall: useScryfallQueryRunner({
      getWeight: weightAlgorithms.zipf,
      injectPrefix,
    }),
  }[source]

  return (
    <div className='root'>
      <div className='input-column'>
        <h1 className='row'>
          <CoglibIcon isActive={false} size='2em' />
          <span className='page-title'>cogwork librarian</span>
        </h1>

        <QueryForm
          status={queryRunner.status}
          canRunQuery={source === 'scryfall' || memStatus === 'success'}
          execute={() => queryRunner.run(subQueries, options)}
          queries={queries}
          setQueries={setQueries}
          options={options}
          setOptions={setOptions}
          source={source}
          setSource={setSource}
          dbSettings={
            <DatabaseSettings
              dbStatus={dbStatus}
              saveToDB={saveToDB}
              setMemory={setMemory}
              manifest={manifest}
              setManifest={setManifest}
            />
          }
        />

        <SavedCards savedCards={savedCards} setSavedCards={setSavedCards} />
        {viewport.desktop && <Footer />}
      </div>

      <BrowserView
        report={queryRunner.report}
        result={queryRunner.result}
        status={queryRunner.status}
        errors={queryRunner.errors}
        addCard={addCard}
        addIgnoredId={addIgnoredId}
        ignoredIds={ignoredIds}
        source={source}
      />
      {viewport.mobile && <Footer />}
    </div>
  )
}
