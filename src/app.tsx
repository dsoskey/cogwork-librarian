import React, { useContext, useEffect, useState } from 'react'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { DndProvider } from 'react-dnd'
import { CogDBContext, useCogDB } from './api/local/useCogDB'
import { AppInfo, WhatsNext } from './ui/appInfo'
import { ListImporterContext, useListImporter } from './api/local/useListImporter'
import { Navigate, Route, Routes, useLocation } from 'react-router'
import { SavedCardsEditor } from './ui/savedCards'
import { ToasterMessage, Toaster, ToasterContext } from './ui/component/toaster'
import { v4 as uuidv4 } from 'uuid';
import { SearchView } from './ui/searchView'
import { BulkCubeImporterContext, useBulkCubeImporter } from './api/cubecobra/useBulkCubeImporter'
import { HistoryView } from './ui/historyView'
import { DocsView } from './ui/docs/docsView'
import { FlagContext } from './ui/flags'
import { ProjectContext, useProjectDao } from './api/local/useProjectDao'
import { SettingsView } from './ui/settingsView'
import { CubeView } from './ui/cubeView'
import { CardDataView } from './ui/data/cardDataView'
import { CubeDataView } from './ui/data/cubeDataView'
import { NotFoundView } from './ui/notFoundView'
import { ErrorBoundary } from 'react-error-boundary'
import { RenderErrorFallback } from './ui/renderErrorFallback'
import { DefaultLayout } from './ui/layout/defaultLayout'
import { TagManager } from './ui/data/tagManager'
import { OtagView } from './ui/views/tag/otagView'
import { ContextMenu, handleClickOutsideContextMenu } from './ui/component/contextMenu/contextMenu'
import Prism from 'prismjs'
import { hookContextMenu } from './api/local/syntaxHighlighting'

export const App = () => {
  const { } = useContext(FlagContext).flags;
  const [cubeContext, setCubeContext] = useState<string>("")

  const cogDB = useCogDB()
  const listImporter = useListImporter(cogDB)
  const bulkCubeImporter = useBulkCubeImporter()

  const project = useProjectDao()

  const [messages, setMessages] = useState<ToasterMessage[]>([])
  const addMessage = (text: string, dismissible: boolean) => {
    const message: ToasterMessage = { id: uuidv4() ,text, dismissible }
    setMessages(prev => [...prev, message])
    return message.id
  }
  const dismissMessage = (messageId: string) => {
    setMessages(prev => prev.filter(it => it.id !== messageId))
  }
  useEffect(() => {
    cogDB.resetDB()
    Prism.hooks.add("complete", hookContextMenu(setCubeContext))
  }, [])

  return (
    <CogDBContext.Provider value={cogDB}>
      <ListImporterContext.Provider value={listImporter}>
        <BulkCubeImporterContext.Provider value={bulkCubeImporter}>
          <ProjectContext.Provider value={project}>
            <ToasterContext.Provider value={{ messages, addMessage, dismissMessage }}>
              <DndProvider backend={HTML5Backend}>
                <ErrorBoundary FallbackComponent={RenderErrorFallback}>
                  <div className='root' onClick={handleClickOutsideContextMenu}>
                      <Routes>
                        <Route path="/data/cube/*" element={<DefaultLayout><CubeRedirect /></DefaultLayout>} />
                        <Route path="/cube/:key/*" element={<DefaultLayout><CubeView /></DefaultLayout>} />
                        <Route path='/data/card' element={<DefaultLayout><CardDataView /></DefaultLayout>}/>
                        <Route path='/data/otag/:tag' element={<DefaultLayout><OtagView /></DefaultLayout>}/>
                        <Route path='/data/otag' element={<DefaultLayout><TagManager /></DefaultLayout>}/>
                        <Route path='/cube' element={<DefaultLayout><CubeDataView /></DefaultLayout>}/>
                        <Route
                          path='/saved'
                          element={<DefaultLayout><SavedCardsEditor {...project} /></DefaultLayout>}
                        />
                        <Route path='/about-me' element={<DefaultLayout><AppInfo /></DefaultLayout>} />
                        <Route path='/whats-next/*' element={<DefaultLayout><WhatsNext /></DefaultLayout>} />
                        <Route path='/user-guide/*' element={<DocsView />} />
                        <Route path='/history' element={<DefaultLayout><HistoryView /></DefaultLayout>} />
                        <Route path="/settings" element={<DefaultLayout><SettingsView /></DefaultLayout>} />
                        <Route path="/" element={<SearchView />} />
                        <Route path="*" element={<DefaultLayout><NotFoundView /></DefaultLayout>} />
                      </Routes>
                    <Toaster />
                    <ContextMenu contextKey={cubeContext} />
                  </div>
                </ErrorBoundary>
              </DndProvider>
            </ToasterContext.Provider>
          </ProjectContext.Provider>
        </BulkCubeImporterContext.Provider>
      </ListImporterContext.Provider>
    </CogDBContext.Provider>
  )
}

function CubeRedirect() {
  const { pathname } = useLocation();
  return <Navigate to={pathname.replace("/data","")} replace />
}