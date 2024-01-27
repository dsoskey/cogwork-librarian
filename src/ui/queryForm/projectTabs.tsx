import React, { useContext, useReducer, useState } from 'react'
import { Modal } from '../component/modal'
import { ProjectContext, splitPath } from '../../api/local/useProjectDao'
import { FormField } from '../component/formField'
import "./projectTabs.css";
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'
import { FileExplorer } from './fileExplorer'

const ProjectExplorer = ({ selectedPath, onPathSelected }) => {
  const projects = useLiveQuery(() => cogDB.project.toArray())
  const projectFolders = []//useLiveQuery(() => cogDB.projectFolder.toArray())

  if (projectFolders === undefined || projects === undefined)
    return <div>loading project info...</div>

  const projectPaths = projects.map(it => it.path);
  const folderPaths = []//projectFolders.map(it => it.path);
  return <FileExplorer
    filePaths={projectPaths} dirPaths={folderPaths}
    onPathSelected={onPathSelected} selectedPath={selectedPath}
  />
}
const ProjectTab = ({ canClose, onClose, path, selected, setSelected }) => {
  const [editing, setEditing] = useState<boolean>(false)
  const [_, project] = splitPath(path);

  return <div className={`project-tab row center ${selected ? "active":""}`}>
    {canClose && <button onClick={onClose} title='close'>X</button>}
    {editing && <input onClick={() => setEditing(false)} value={path} onChange={() => {}}/>}
    {!editing && <div onClick={() => {
      if (selected) {
        setEditing(true)
      } else {
        setSelected()
      }
    }}>{project}</div>}
  </div>
}

enum ModalState {
  closed, new, open
}

const ProjectModal = ({ modalState, setModalState, dispatchTabState }) => {
  const { createProject, openProject } = useContext(ProjectContext);
  const [folderToSubmit] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [projectToSubmit, setProjectToSubmit] = useState<string>("my-project");
  const [selectedPath, setSelectedPath] = useState<string>("");

  let modalTitle;
  let modalChildren;
  switch (modalState) {
    case ModalState.closed:
      break;
    case ModalState.new: {
      const onClick = () => {
        const toSubmit = projectToSubmit.trim()
        if (toSubmit.length === 0) {
          console.warn("empty project name, skipping...");
          return;
        }
        const path = `${folderToSubmit}/${toSubmit}`;
        createProject(path)
          .then((project) => {
            setModalState(ModalState.closed);
            dispatchTabState({ type: "new", path: project.path })
          })
          .catch(() => setError(`a project already exists at ${path}`))
      }
      modalTitle= "New project"
      modalChildren = <div>
        {/* TODO: replace with file navigator. */}
        <FormField title="Project folder">
          {<input disabled value="" placeholder="using root folder" />}
        </FormField>
        <FormField
          title="project name"
          description="projects must be uniquely named within their folder">
          {<input value={projectToSubmit} onChange={e => setProjectToSubmit(e.target.value)} />}
        </FormField>
        {error && <div className='alert'>{error}</div>}
        <button onClick={onClick}>Create project</button>
      </div>
      break;
    }

    case ModalState.open: {
      const onClick = () => {
        openProject(selectedPath)
          .then((project) => {
            setModalState(ModalState.closed);
            dispatchTabState({ type: "open", path: project.path })
          })
          .catch(console.error)
      }
      modalTitle = "Open project"
      modalChildren = <div>
        <ProjectExplorer selectedPath={selectedPath} onPathSelected={setSelectedPath} />
        <button disabled={selectedPath === ""} onClick={onClick}>Open project</button>
      </div>
      break;
    }
  }

  return <Modal
    open={modalState !== ModalState.closed}
    title={<h2>{modalTitle}</h2>}
    onClose={() => {
      setModalState(ModalState.closed)
      setError("")
    }}
    children={modalChildren}
  />
}
function reducer(state: { active: string[], selectedIndex: number }, action) {
  let result;
  switch (action.type) {
    case "new":
      result = {
        active: [...state.active, action.path],
        selectedIndex: state.active.length,
      }
      break;
    case "open": {
      const index = state.active.findIndex(it => it === action.path);
      if (index === -1) {
        result = {
          active: [...state.active, action.path],
          selectedIndex: state.active.length,
        }
      } else {
        result =  {
          ...state,
          selectedIndex: index,
        }
      }
      break;
    }
    case "select":
      result = {
        ...state,
        selectedIndex: action.index,
      }
      break;
    case "close": {
      const index = action.index;
      let selectedIndex = state.selectedIndex;
      if (index === selectedIndex) {
        selectedIndex = index === 0 ? index : index - 1;
      }
      result = {
        selectedIndex,
        // @ts-ignore
        active: state.active.toSpliced(index, 1),
      }
      break;
    }
    default:
      throw Error(`Unknown action ${action.type}`)
  }
  localStorage.setItem("tab-state.coglib.sosk.watch", JSON.stringify(result));
  return result;
}


export const ProjectTabs = () => {
  const maxOpenProjects = 5;
  const { openProject, currentPath } = useContext(ProjectContext);
  const [modalState, setModalState] = useState<ModalState>(ModalState.closed)
  const [tabState, dispatchTabState] = useReducer(reducer, "tab-state.coglib.sosk.watch", (key) => {
    const storageResult = localStorage.getItem(key);
    if (storageResult) {
      return JSON.parse(storageResult)
    }

    const initial = {
      active: [currentPath],
      selectedIndex: 0,
    }
    localStorage.setItem(key, JSON.stringify(initial))

    return initial
  });

  return <>
    <div className="row center">
      <strong>recent projects: </strong>
      {tabState.active.map((it, i) =>
        <ProjectTab
          key={i}
          path={it}
          selected={tabState.selectedIndex === i}
          setSelected={() => {
            openProject(it)
              .then(() => dispatchTabState({ type: "select", index: i }))
              .catch(console.error)
          }}
          canClose={tabState.active.length > 1}
          onClose={() => {
            const nextIndex = i === 0 ? 1 : i - 1;
            openProject(tabState.active[nextIndex])
              .then(() => dispatchTabState({ type: "close", index: i }))
              .catch(console.error)
          }}
      />)}
      <button className="project-action" onClick={() => setModalState(ModalState.open)} title='load project'>📂</button>
      {tabState.active.length < maxOpenProjects &&
        <button className="project-action" onClick={() => setModalState(ModalState.new)} title='new project'>✚</button>
      }
    </div>
    <ProjectModal
      modalState={modalState}
      setModalState={setModalState}
      dispatchTabState={dispatchTabState}
    />
  </>
}