import React, { useCallback, useContext, useState } from 'react'
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
import { useMemoryQueryRunner } from './api/local/useQueryRunner'
import { useProject, ProjectContext } from './api/useProject'
import { Footer } from './ui/footer'
import { useViewportListener } from './viewport'
import { CoglibIcon } from './ui/component/coglibIcon'
import { queryExamples } from './api/example'
import _random from 'lodash/random'
import { ExampleGallery } from './ui/queryForm/exampleGallery'
import { SyntaxDocs } from './ui/docs/syntaxDocs'
import { AppInfo } from './ui/appInfo'
import { ListImporterContext, useListImporter } from './api/local/useListImporter'
import { FlagContext } from './flags'
import { AdminPanel } from './ui/adminPanel'
import { Route, Switch, useLocation } from 'react-router'
import { DataView } from './ui/data/dataView'
import { Link } from 'react-router-dom'
import { subHeader } from './ui/router'

export const App = () => {
  const { adminMode } = useContext(FlagContext).flags
  const { pathname } = useLocation()
  const cogDB = useCogDB()
  const listImporter = useListImporter({memory: cogDB.memory})
  const viewport = useViewportListener()
  const [source, setSource] = useLocalStorage<DataSource>('source', 'scryfall')

  const project = useProject()
  const { addIgnoredId, ignoredIds, addCard } = project

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

  const [showCogLib, setShowCogLib] = useState<boolean>(true)
  const execute = () => queryRunner.run(subQueries, options).then(() => setShowCogLib(false))

  return (
    <CogDBContext.Provider value={cogDB}>
      <ListImporterContext.Provider value={listImporter}>
        <ProjectContext.Provider value={project}>
          <div className='root'>

            <div className={`cogwork-librarian ${showCogLib ? "show":"hide"}`}>
              <div className={`row masthead`}>
                <Link to='/'><CoglibIcon isActive={adminMode} size='3em' /></Link>

                <div className='column'>
                  <h1 className='page-title'>{subHeader[pathname]}</h1>
                  <div className='row'>

                    <AppInfo />

                    <ExampleGallery setQueries={setQueries} />

                    <SyntaxDocs />

                    {adminMode && <AdminPanel />}
                  </div>
                </div>
                  <button
                    className='toggle'
                    onClick={() => setShowCogLib(prev => !prev)}
                    title={`${showCogLib ? "close":"open"} controls`}
                  >
                    {showCogLib ? "<<":">>"}
                  </button>
              </div>

              {showCogLib && <Switch>
                <Route path='/data' exact>
                  <DataView />
                </Route>
                <Route>
                  <div className='input-column'>

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

                    {/*<SavedCards savedCards={savedCards} setSavedCards={setSavedCards} />*/}
                  </div>
                </Route>
              </Switch>}
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
            {viewport.desktop && <Footer />}
          </div>
        </ProjectContext.Provider>
      </ListImporterContext.Provider>
    </CogDBContext.Provider>

  )
}
