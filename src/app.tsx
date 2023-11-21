import React, { useContext, useState } from 'react'
import { CogDBContext, useCogDB } from './api/local/useCogDB'
import { useProject, ProjectContext } from './api/useProject'
import { Footer } from './ui/footer'
import { ExampleGallery } from './ui/docs/exampleGallery'
import { AppInfo } from './ui/appInfo'
import { ListImporterContext, useListImporter } from './api/local/useListImporter'
import { Route, Routes, useLocation } from 'react-router'
import { DataView } from './ui/data/dataView'
import { SavedCards } from './ui/savedCards'
import { ToasterMessage, Toaster, ToasterContext } from './ui/component/toaster'
import { v4 as uuidv4 } from 'uuid';
import { SearchView } from './ui/searchView'
import { Masthead } from './ui/component/masthead'
import { BulkCubeImporterContext, useBulkCubeImporter } from './api/cubecobra/useBulkCubeImporter'
import { SyntaxDocs } from './ui/docs/syntaxDocs'
import { HistoryView } from './ui/historyView'
import { DocsView } from './ui/docs/docsView'
import { FlagContext } from './flags'

export const App = () => {
  const { pathname } = useLocation()
  const { docsUpdate } = useContext(FlagContext).flags;

  const cogDB = useCogDB()
  const listImporter = useListImporter(cogDB)
  const bulkCubeImporter = useBulkCubeImporter()

  const project = useProject()

  const [messages, setMessages] = useState<ToasterMessage[]>([])
  const addMessage = (text: string, dismissible: boolean) => {
    const message: ToasterMessage = { id: uuidv4() ,text, dismissible }
    setMessages(prev => [...prev, message])
    return message.id
  }
  const dismissMessage = (messageId: string) => {
    setMessages(prev => prev.filter(it => it.id !== messageId))
  }

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
                    <Route path='/data/*' element={<DataView />}/>
                    <Route
                      path='/saved'
                      element={<SavedCards savedCards={project.savedCards} setSavedCards={project.setSavedCards} />}
                    />
                    <Route path='/about-me' element={<AppInfo />} />
                    <Route path='/examples' element={<ExampleGallery />} />
                    <Route path='/user-guide' element={docsUpdate ? <DocsView /> : <SyntaxDocs />} />
                    <Route path='/history' element={<HistoryView />} />
                    <Route element={<div>404'ed!</div>} />
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
