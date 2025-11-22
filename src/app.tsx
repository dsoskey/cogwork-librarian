import React, { useEffect, useState } from 'react'
import { CogDBContext, useCogDB } from './api/local/useCogDB'
import { AppInfo, WhatsNext } from './ui/views/appInfo'
import { ListImporterContext, useListImporter } from './api/local/useListImporter'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { SavedCardsEditor } from './ui/savedCards'
import { Toaster, ToasterContext, useToaster
} from './ui/component/toaster'
import { SearchView } from './ui/searchView'
import { BulkCubeImporterContext, useBulkCubeImporter } from './api/cubecobra/useBulkCubeImporter'
import { DocsView } from './ui/docs/docsView'
import { ProjectContext, useProjectDao } from './api/local/useProjectDao'
import { SettingsView } from './ui/settingsView'
import { CubeView } from './ui/cubeView'
import { CardDataView } from './ui/data/cardDataView'
import { CubeListView } from './ui/data/cubeListView'
import { NotFoundView } from './ui/notFoundView'
import { ErrorBoundary } from 'react-error-boundary'
import { RenderErrorFallback } from './ui/renderErrorFallback'
import { DefaultLayout } from './ui/layout/defaultLayout'
import { TagManager } from './ui/data/tagManager'
import { OtagView } from './ui/views/tag/otagView'
import { ContextMenu, handleClickOutsideContextMenu } from './ui/component/contextMenu/contextMenu'
import Prism from 'prismjs'
import { hookContextMenu } from './api/local/syntaxHighlighting'
import { useLocalStorage } from './api/local/useLocalStorage'
import { DEFAULT_GUTTER_COLUMNS, GutterColumn } from './ui/component/editor/textEditor'
import { SidebarOpenIcon } from './ui/icons/sidebarOpen'
import { SidebarClosedIcon } from './ui/icons/sidebarClosed'
import { SettingsContext } from './ui/settingsContext'
import { CardList } from './ui/views/cardList/cardList'

export const App = () => {
  const [cubeContext, setCubeContext] = useState<string>('')
  const [gutterColumns, setGutterColumns] = useLocalStorage<GutterColumn[]>('editor.info', DEFAULT_GUTTER_COLUMNS)
  const [lineHeight, setLineHeight] = useLocalStorage<number>("editor.line-height", 125)

  const cogDB = useCogDB()
  const { memory } = cogDB
  const listImporter = useListImporter(cogDB)
  const bulkCubeImporter = useBulkCubeImporter()

  const project = useProjectDao()
  const {
    path,
    savedCards, setSavedCards,
    renameQuery, queries, setQueries, addCards,
    toggleIgnoreId, ignoredIds
  } = project
  const [showSavedCards, setShowSavedCards] = useLocalStorage<boolean>('showSavedCards', true)
  const toaster = useToaster()

  useEffect(() => {
    cogDB.resetDB()
    Prism.hooks.add('complete', hookContextMenu(setCubeContext))
  }, [])

  return (
    <SettingsContext.Provider value={{ gutterColumns, setGutterColumns, lineHeight: lineHeight / 100, setLineHeight }}>
      <CogDBContext.Provider value={cogDB}>
        <ListImporterContext.Provider value={listImporter}>
          <BulkCubeImporterContext.Provider value={bulkCubeImporter}>
            <ProjectContext.Provider value={project}>
              <ToasterContext.Provider value={toaster}>
                <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                  <div className='root' onClick={handleClickOutsideContextMenu}>
                    <Routes>
                      <Route path="/list" element={<CardList />} />
                      <Route path='/data/cube/*' element={<DefaultLayout><CubeRedirect /></DefaultLayout>} />
                      <Route path='/cube/:key/*' element={<DefaultLayout><CubeView /></DefaultLayout>} />
                      <Route path='/data/card' element={<DefaultLayout><CardDataView /></DefaultLayout>} />
                      <Route path='/data/otag/:tag' element={<DefaultLayout><OtagView /></DefaultLayout>} />
                      <Route path='/data/otag' element={<DefaultLayout><TagManager /></DefaultLayout>} />
                      <Route path='/cube' element={<DefaultLayout><CubeListView /></DefaultLayout>} />
                      <Route path='/about-me' element={<DefaultLayout><AppInfo /></DefaultLayout>} />
                      <Route path='/whats-next/*' element={<DefaultLayout><WhatsNext /></DefaultLayout>} />
                      <Route path='/user-guide/*' element={<DocsView />} />
                      <Route path='/settings' element={<DefaultLayout><SettingsView /></DefaultLayout>} />
                      <Route path='/' element={
                        <div className='search-view-root'>
                          <SearchView
                            memory={memory}
                            addCards={addCards}
                            path={path}
                            queries={queries}
                            setQueries={setQueries}
                            toggleIgnoreId={toggleIgnoreId}
                            ignoredIds={ignoredIds}
                          />
                          <div className={`saved-cards-floater ${showSavedCards ? 'show' : 'hide'}`}>
                            {showSavedCards && <SavedCardsEditor
                              path={path}
                              savedCards={savedCards}
                              setSavedCards={setSavedCards}
                              renameQuery={renameQuery}
                            />}
                          </div>
                          <button
                            className={`floating-saved-cards-toggle ${showSavedCards ? 'show' : 'hide'}`}
                            title={`${showSavedCards ? 'Hide':'Show'} saved cards`}
                            onClick={() => setShowSavedCards(prevState => !prevState)}
                          >{showSavedCards
                            ? <SidebarOpenIcon size={32} /> : <SidebarClosedIcon size={32} />}
                          </button>
                        </div>
                      } />
                      <Route path='*' element={<DefaultLayout><NotFoundView /></DefaultLayout>} />
                    </Routes>
                    <Toaster />
                    <ContextMenu contextKey={cubeContext} />
                  </div>
                </ErrorBoundary>
              </ToasterContext.Provider>
            </ProjectContext.Provider>
          </BulkCubeImporterContext.Provider>
        </ListImporterContext.Provider>
      </CogDBContext.Provider>
    </SettingsContext.Provider>
  )
}

function CubeRedirect() {
  const { pathname } = useLocation()
  return <Navigate to={pathname.replace('/data', '')} replace />
}