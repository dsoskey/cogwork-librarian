import React, { useCallback } from 'react'
import { BrowserView } from './ui/cardBrowser/browserView'
import { CogDBContext, useCogDB } from './api/local/useCogDB'
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
import { CoglibIcon } from './api/memory/coglibIcon'
import { queryExamples } from './api/example'
import _random from 'lodash/random'
import { ExampleGallery } from './ui/queryForm/exampleGallery'
import { SyntaxDocs } from './ui/queryForm/syntaxDocs'
import { AppInfo } from './ui/appInfo'
import { ListImporterContext, useListImporter } from './api/local/useListImporter'

export const App = () => {
  const cogDB = useCogDB()
  const listImporter = useListImporter({memory: cogDB.memory})
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
      corpus: cogDB.memory,
      injectPrefix,
    }),
    scryfall: useScryfallQueryRunner({
      getWeight: weightAlgorithms.zipf,
      injectPrefix,
    }),
  }[source]
  const execute = () => queryRunner.run(subQueries, options)

  return (
    <CogDBContext.Provider value={cogDB}>
      <ListImporterContext.Provider value={listImporter}>
        <div className='root'>
          <div className='input-column'>
            <div className='row'>
              <h1 className='row'>
                <CoglibIcon isActive={false} size='2em' />
                <span className='page-title'>cogwork librarian</span>
              </h1>

              <ExampleGallery setQueries={setQueries} />

              <SyntaxDocs />

              <AppInfo />
            </div>


            <QueryForm
              status={queryRunner.status}
              canRunQuery={source === 'scryfall' || cogDB.memStatus === 'success'}
              execute={execute}
              queries={queries}
              setQueries={setQueries}
              options={options}
              setOptions={setOptions}
              source={source}
              setSource={setSource}
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
      </ListImporterContext.Provider>
    </CogDBContext.Provider>

  )
}
