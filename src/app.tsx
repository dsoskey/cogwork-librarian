import React, { useCallback, useContext, useEffect, useState } from 'react'
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
import { ExampleGallery, ExampleGalleryLink } from './ui/queryForm/exampleGallery'
import { SyntaxDocs, SyntaxDocsLink } from './ui/docs/syntaxDocs'
import { AppInfo, AppInfoLink } from './ui/appInfo'
import { ListImporterContext, useListImporter } from './api/local/useListImporter'
import { FlagContext } from './flags'
import { AdminPanel } from './ui/adminPanel'
import { Route, Switch, useLocation } from 'react-router'
import { DataView } from './ui/data/dataView'
import { Link } from 'react-router-dom'
import { subHeader } from './ui/router'
import { DatabaseLink } from './ui/queryForm/databaseSettings'
import { SearchError } from './ui/component/searchError'
import { SavedCards } from './ui/savedCards'
import { ToasterMessage, Toaster, ToasterContext } from './ui/component/toaster'
import { v4 as uuidv4 } from 'uuid';

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
  const [lockCoglib, setLockCogLib] = useLocalStorage<boolean>('lock-coglib', false)

  const [messages, setMessages] = useState<ToasterMessage[]>([])
  const addMessage = (text: string, dismissible: boolean) => {
    const message: ToasterMessage = { id: uuidv4() ,text, dismissible }
    setMessages(prev => [...prev, message])
    return message.id
  }
  const dismissMessage = (messageId: string) => {
    setMessages(prev => prev.filter(it => it.id !== messageId))
  }

  const execute = () => queryRunner.run(subQueries, options)
    .then(() => {
      if (!lockCoglib) {
        setShowCogLib(false)
      }
    })

  const listener = (event: KeyboardEvent) => {
    if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') {
      setShowCogLib(prev => !prev)
    }
  }

  useEffect(() => {
    document.addEventListener('keydown', listener)
    return () => document.removeEventListener('keydown', listener)
  }, [])

  return (
    <CogDBContext.Provider value={cogDB}>
      <ListImporterContext.Provider value={listImporter}>
        <ProjectContext.Provider value={project}>
          <ToasterContext.Provider value={{ messages, addMessage, dismissMessage }}>
            <div className='root'>
              <div className={`cogwork-librarian ${pathname.replace("/","")} ${showCogLib ? "show":"hide"}`}>
                <div className={`row masthead`}>
                  {(showCogLib || viewport.mobile) && adminMode && <AdminPanel><CoglibIcon isActive={adminMode} size='3em' /></AdminPanel>}
                  {(showCogLib || viewport.mobile) && !adminMode && <CoglibIcon size='3em' />}

                  {(showCogLib || viewport.mobile) && <div className='column'>
                    <h1 className='page-title'>{subHeader[pathname]}</h1>
                    <div className='row'>

                      <Link to='/'>search</Link>

                      <Link to='/saved'>saved cards</Link>

                      <DatabaseLink />

                      <AppInfoLink />

                      <ExampleGalleryLink />

                      <SyntaxDocsLink />

                    </div>
                  </div>}
                  <div className='toggle'>
                    <button
                      onClick={() => setLockCogLib(prev => !prev)}
                      title={`${lockCoglib ? "unlock":"lock"} controls`}>{lockCoglib ? "🔒":"🔓"}
                    </button>
                    {queryRunner.status !== 'unstarted' && <button
                      onClick={() => setShowCogLib(prev => !prev)}
                      title={`${showCogLib ? "close":"open"} controls`}
                    >
                      {viewport.mobile ? (showCogLib ? "^" : "v") : (showCogLib ? "<<":">>")}
                    </button>}
                  </div>
                </div>

                {showCogLib && <Switch>
                  <Route path='/data' exact>
                    <DataView />
                  </Route>
                  <Route path='/saved' exact>
                    <SavedCards savedCards={project.savedCards} setSavedCards={project.setSavedCards} />
                  </Route>
                  <Route path='/about-me' exact>
                    <AppInfo />
                  </Route>
                  <Route path='/examples' exact>
                    <ExampleGallery setQueries={setQueries} />
                  </Route>
                  <Route path='/user-guide' exact>
                    <SyntaxDocs />
                  </Route>
                  <Route>
                    <div className='search-root'>
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

                      {queryRunner.status === 'error' && <SearchError
                        report={queryRunner.report}
                        source={source}
                        errors={queryRunner.errors}
                      />}
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
                lockCoglib={lockCoglib}
                openCoglib={() => setShowCogLib(true)}
              />
              <Footer />
              <Toaster />
            </div>
          </ToasterContext.Provider>
        </ProjectContext.Provider>
      </ListImporterContext.Provider>
    </CogDBContext.Provider>

  )
}
