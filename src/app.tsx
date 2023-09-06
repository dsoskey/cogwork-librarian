import React, { useState } from 'react'
import { CogDBContext, useCogDB } from './api/local/useCogDB'
import { useProject, ProjectContext } from './api/useProject'
import { Footer } from './ui/footer'
import { ExampleGallery } from './ui/queryForm/exampleGallery'
import { AppInfo } from './ui/appInfo'
import { ListImporterContext, useListImporter } from './api/local/useListImporter'
import { Route, Switch, useLocation } from 'react-router'
import { DataView } from './ui/data/dataView'
import { SavedCards } from './ui/savedCards'
import { ToasterMessage, Toaster, ToasterContext } from './ui/component/toaster'
import { v4 as uuidv4 } from 'uuid';
import { SearchView } from './ui/searchView'
import { Masthead } from './ui/component/masthead'
import { BulkCubeImporterContext, useBulkCubeImporter } from './api/cubecobra/useBulkCubeImporter'
import { SyntaxDocs } from './ui/docs/syntaxDocs'

export const App = () => {
  const { pathname } = useLocation()

  const cogDB = useCogDB()
  const listImporter = useListImporter(cogDB)
  const bulkCubeImporter = useBulkCubeImporter(cogDB)

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
                  <Switch>
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
                      <ExampleGallery />
                    </Route>
                    <Route path='/user-guide' exact>
                      <SyntaxDocs />
                    </Route>
                    <Route>
                      <div>404'ed!</div>
                    </Route>
                  </Switch>
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
