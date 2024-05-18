import React, { useContext, useState } from 'react'
import { CogDBContext, useCogDB } from './api/local/useCogDB'
import { Footer } from './ui/footer'
import { AppInfo } from './ui/appInfo'
import { ListImporterContext, useListImporter } from './api/local/useListImporter'
import { Route, Routes, useLocation } from 'react-router'
import { SavedCardsEditor } from './ui/savedCards'
import { ToasterMessage, Toaster, ToasterContext } from './ui/component/toaster'
import { v4 as uuidv4 } from 'uuid';
import { SearchView } from './ui/searchView'
import { Masthead } from './ui/component/masthead'
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

export const App = () => {
  const { pathname } = useLocation()
  const { } = useContext(FlagContext).flags;

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
  }, [])

  return (
    <CogDBContext.Provider value={cogDB}>
      <ListImporterContext.Provider value={listImporter}>
        <BulkCubeImporterContext.Provider value={bulkCubeImporter}>
            <ProjectContext.Provider value={project}>
              <ToasterContext.Provider value={{ messages, addMessage, dismissMessage }}>
                <div className='root'>
                  {pathname === "/" && <SearchView />}
                  {pathname !== "/" && <>
                    <Masthead/>
                    <Routes>
                      <Route path="/data/cube/:key" element={<CubeView />} />
                      <Route path='/data/card' element={<CardDataView/>}/>
                      <Route path='/data/cube' element={<CubeDataView/>}/>
                      <Route
                        path='/saved'
                        element={<SavedCardsEditor {...project} />}
                      />
                      <Route path='/about-me' element={<AppInfo />} />
                      <Route path='/user-guide/*' element={<DocsView />} />
                      <Route path='/history' element={<HistoryView />} />
                      <Route path="/settings" element={<SettingsView />} />
                      <Route path="*" element={<NotFoundView />} />
                    </Routes>
                    <Footer />
                  </>}
                  <Toaster />
                </div>
              </ToasterContext.Provider>
            </ProjectContext.Provider>
        </BulkCubeImporterContext.Provider>
      </ListImporterContext.Provider>
    </CogDBContext.Provider>
  )
}
