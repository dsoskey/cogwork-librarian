import React, { useContext, useEffect, useState } from 'react'
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
import { DatabaseLink } from './ui/queryForm/databaseSettings'
import { SearchError } from './ui/component/searchError'
import { SavedCards } from './ui/savedCards'
import { ToasterMessage, Toaster, ToasterContext } from './ui/component/toaster'
import { v4 as uuidv4 } from 'uuid';

export const App = () => {
  const { adminMode, multiQuery } = useContext(FlagContext).flags
  const { pathname } = useLocation()
  const topPath = pathname.replace("/","").split("/")[0]

  const cogDB = useCogDB()
  const listImporter = useListImporter({memory: cogDB.memory})
  const viewport = useViewportListener()
  const [source, setSource] = useLocalStorage<DataSource>('source', 'scryfall')

  const project = useProject()
  const { addIgnoredId, ignoredIds, addCard } = project

  const { queries, setQueries, options, setOptions } = useQueryForm({
    example: () => queryExamples[_random(queryExamples.length - 1)],
  })

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

  const [messages, setMessages] = useState<ToasterMessage[]>([])
  const addMessage = (text: string, dismissible: boolean) => {
    const message: ToasterMessage = { id: uuidv4() ,text, dismissible }
    setMessages(prev => [...prev, message])
    return message.id
  }
  const dismissMessage = (messageId: string) => {
    setMessages(prev => prev.filter(it => it.id !== messageId))
  }

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
              <div className={`cogwork-librarian ${topPath} ${showCogLib ? "show":"hide"}`}>
                <div className={`row masthead`}>
                  {(showCogLib || viewport.mobile) && adminMode && <AdminPanel><CoglibIcon isActive={adminMode} size='3em' /></AdminPanel>}
                  {(showCogLib || viewport.mobile) && !adminMode && <CoglibIcon size='3em' />}

                  {(showCogLib || viewport.mobile) && <div>
                    <h1 className='page-title'>cogwork librarian</h1>
                    <div className='row'>

                      <Link to='/' className={pathname === "/" ? "active-link" : ""}>search</Link>

                      <Link to='/saved' className={pathname === "/saved" ? "active-link" : ""}>saved cards</Link>

                      <DatabaseLink active={topPath === 'data'} />

                      <Link to='/about-me' className={pathname === "/about-me" ? "active-link" : ""}>about me</Link>

                      <Link to='/examples' className={topPath === "examples" ? "active-link" : ""}>examples</Link>

                      <Link to='/user-guide' className={topPath === "user-guide" ? "active-link" : ""}>syntax guide</Link>

                    </div>
                  </div>}
                  <div className='toggle'>
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
                </div>

                {showCogLib && <Switch>
                  <Route path='/data'>
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
                lockCoglib={lockCogLib}
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
