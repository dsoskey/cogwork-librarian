import React, { useContext, useState } from 'react'
import { CogDBContext, useCogDB } from './api/local/useCogDB'
import { useProject, ProjectContext } from './api/useProject'
import { Footer } from './ui/footer'
import { CoglibIcon } from './ui/component/coglibIcon'
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
import { SavedCards } from './ui/savedCards'
import { ToasterMessage, Toaster, ToasterContext } from './ui/component/toaster'
import { v4 as uuidv4 } from 'uuid';
import { SearchView } from './ui/searchView'

export const App = () => {
  const { adminMode } = useContext(FlagContext).flags
  const { pathname } = useLocation()
  const topPath = pathname.replace("/","").split("/")[0]

  const cogDB = useCogDB()
  const listImporter = useListImporter({memory: cogDB.memory})

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

  // const listener = (event: KeyboardEvent) => {
  //   if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'z') {
  //     setShowCogLib(prev => !prev)
  //   }
  // }
  //
  // useEffect(() => {
  //   document.addEventListener('keydown', listener)
  //   return () => document.removeEventListener('keydown', listener)
  // }, [])

  const masthead = <div className={`row masthead`}>
    {adminMode && <AdminPanel><CoglibIcon isActive={adminMode} size='3em' /></AdminPanel>}
    {!adminMode && <CoglibIcon size='3em' />}

    <div>
      <h1 className='page-title'>cogwork librarian</h1>
      <div className='row'>

        <Link to='/' className={pathname === "/" ? "active-link" : ""}>search</Link>

        <DatabaseLink active={topPath === 'data'} />

        <Link to='/about-me' className={topPath === "about-me" ? "active-link" : ""}>about me</Link>

        <Link to='/examples' className={topPath === "examples" ? "active-link" : ""}>examples</Link>

        <Link to='/user-guide' className={topPath === "user-guide" ? "active-link" : ""}>syntax guide</Link>

      </div>
    </div>
  </div>

  return (
    <CogDBContext.Provider value={cogDB}>
      <ListImporterContext.Provider value={listImporter}>
        <ProjectContext.Provider value={project}>
          <ToasterContext.Provider value={{ messages, addMessage, dismissMessage }}>
            <div className='root'>
              {masthead}
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
                  <ExampleGallery setQueries={() => {}} />
                </Route>
                <Route path='/user-guide' exact>
                  <SyntaxDocs />
                </Route>
                <Route>
                  <SearchView />
                </Route>
              </Switch>

              {/*<div className={`cogwork-librarian ${topPath} ${showCogLib ? "show":"hide"}`}>*/}
              {/*  {showCogLib && }*/}
              {/*</div>*/}

              <Footer />
              <Toaster />
            </div>
          </ToasterContext.Provider>
        </ProjectContext.Provider>
      </ListImporterContext.Provider>
    </CogDBContext.Provider>

  )
}
