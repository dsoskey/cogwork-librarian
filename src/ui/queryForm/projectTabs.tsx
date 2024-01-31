import React, { useContext, useReducer, useState } from 'react'
import { Modal } from '../component/modal'
import { ProjectContext, splitPath } from '../../api/local/useProjectDao'
import { FormField } from '../component/formField'
import './projectTabs.css'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'
import {
  ExplorerCtx,
  FileExplorer,
  Path, PATH_TYPE_STRINGS,
  PathType, RESERVED_PATH,
  SELECT_ALL
} from './fileExplorer'
import { Setter } from '../../types'
import { downloadText } from '../download'
import { Project, serializeProject } from '../../api/local/types/project'
import { useConfirmDelete } from './useConfirmDelete'

const ProjectExplorer = (props: ExplorerCtx) => {
  const projects = useLiveQuery(() => cogDB.project.toArray())
  const projectFolders = useLiveQuery(() => cogDB.projectFolder.toArray())

  if (projectFolders === undefined || projects === undefined)
    return <div>loading project info...</div>

  const projectPaths = projects.map(it => it.path);
  const folderPaths = projectFolders.map(it => it.path);
  return <FileExplorer filePaths={projectPaths} dirPaths={folderPaths} {...props} />
}

interface ProjectTabProps {
  canClose: boolean
  onClose: () => void
  path: string
  selected: boolean
  setSelected: () => void
}
const ProjectTab = ({ canClose, onClose, path, selected, setSelected }: ProjectTabProps) => {
  const [editing, setEditing] = useState<boolean>(false)
  const [_, project] = splitPath(path);

  const onClick = () => {
    if (selected) {
      // setEditing(true)
    } else {
      setSelected()
    }
  }

  return <div onClick={onClick} className={`project-tab row center ${selected ? "active":""}`}>
    {canClose && <button onClick={event => {
      event.stopPropagation();
      onClose()
    }} title='save and close'>X</button>}
    {/*{editing && <input onClick={() => setEditing(false)} value={path} onChange={() => {}}/>}*/}
    {!editing && <div>{project}</div>}
  </div>
}

enum ModalState {
  Closed, New, Open
}

interface ProjectModalProps {
  modalState: ModalState
  setModalState: Setter<ModalState>
  dispatchTabState: (any) => void
}

const ProjectModal = ({ modalState, setModalState, dispatchTabState }: ProjectModalProps) => {
  const project = useContext(ProjectContext);
  const [error, setError] = useState<string>("")
  const [projectToSubmit, setProjectToSubmit] = useState<string>("my-project");
  const [selectedPath, setSelectedPath] = useState<Path>({ path: "", type: PathType.Dir });
  const [createDirParent, setCreateDirParent] = useState<string | undefined>(undefined);
  const [newDir, setNewDir] = useState<string>("");
  const confirmer = useConfirmDelete();
  const [deleting, setDeleting] = useState<boolean>(false)
  const onDeleteClick = () => {
    if (selectedPath.path === "") {
      setError("cant fully delete root, only clear its contents")
      return;
    }
    setDeleting(true)
    let func: (path: string) => Promise<Set<string>>;
    switch (selectedPath.type) {
      case PathType.Dir:
        func = project.deleteFolder
        break;
      case PathType.File:
        func = project.deleteProject
    }
    func(selectedPath.path)
      .then(paths => {
        console.log(paths, "have been deleted. you should do something about it")
        dispatchTabState({ type: "delete", paths })
        confirmer.hide();
      })
      .catch(e => confirmer.setError(e.message))
      .finally(() => setDeleting(false))
  }
  const onCreateFolderClick = () => {
    const toSubmit = newDir.trim();
    if (toSubmit.length === 0) {
      setError("empty folder name");
      return;
    } else if (toSubmit.includes("/")) {
      setError("folder can't include '/'");
      return;
    } else if (toSubmit === RESERVED_PATH) {
      setError(`${RESERVED_PATH} is a reserved name; choose something else`)
      return
    } else {
      setError("")
    }
    const path = `${createDirParent}/${toSubmit}`
    project.createFolder(path)
      .then(() => {
        setCreateDirParent(undefined)
        setNewDir("")
      })
      .catch(e => {
        console.error(e);
        setError(e.message);
      })
  }

  let canCreateProject = selectedPath?.type === PathType.Dir
  const onCreateProjectClick = () => {
    const toSubmit = projectToSubmit.trim()
    if (toSubmit.length === 0) {
      setError("empty project name");
      return;
    } else if (toSubmit.includes("/")) {
      setError("project name can't include '/'");
      return;
    } else if (toSubmit === RESERVED_PATH) {
      setError(`${RESERVED_PATH} is a reserved name; choose something else`)
      return
    } else {
      setError("")
    }
    const path = `${selectedPath.path}/${toSubmit}`;
    project.createProject(path)
      .then((project) => {
        setModalState(ModalState.Closed);
        dispatchTabState({ type: "new", path: project.path })
      })
      .catch(e => {
        console.error(e);
        setError(e.message)
      })
  }

  let canOpenProject = selectedPath?.type === PathType.File
  const onOpenClick = () => {
    project.openProject(selectedPath.path)
      .then((project) => {
        setModalState(ModalState.Closed);
        dispatchTabState({ type: "open", path: project.path })
      })
      .catch(console.error)
  }

  const onExportClick = async () => {
    let toExport: Project;
    if (selectedPath.path === project.path) {
      const now = new Date();
      toExport = { ...project, ignoredCards: [], createdAt: now, updatedAt: now }
    } else {
      toExport = await cogDB.project.get(selectedPath.path);
    }

    if (toExport) {
      downloadText(
        serializeProject(toExport),
        splitPath(selectedPath.path)[1],
        "md"
      )
    }
  }

  return <Modal
    open={modalState !== ModalState.Closed}
    title={<h2>Manage projects</h2>}
    onClose={() => {
      confirmer.hide();
      setModalState(ModalState.Closed)
      setError("")
    }}
  >
    <ProjectExplorer
      canCreateDir
      selectable={SELECT_ALL}
      createNewDir={onCreateFolderClick}
      selectedPath={selectedPath} onPathSelected={setSelectedPath}
      createDirParent={createDirParent} setCreateDirParent={setCreateDirParent}
      newDir={newDir} setNewDir={setNewDir} />

    <FormField
      title="project name"
      description="projects must be uniquely named within their folder">
      {<input
        value={projectToSubmit}
        disabled={!canCreateProject}
        onChange={e => setProjectToSubmit(e.target.value)}
      />}
    </FormField>
    {error && <div className='alert'>{error}</div>}
    <button onClick={onCreateProjectClick} disabled={!canCreateProject}>Create project</button>
    {/*<button onClick={onCreateProjectClick} disabled={!canCreateProject}>Import project</button>*/}
    <button disabled={!canOpenProject} onClick={onOpenClick}>Open project</button>
    <button disabled={!canOpenProject} onClick={onExportClick}>Export project</button>
    <button onClick={() => {
      if (project.path.startsWith(selectedPath.path)) {
        setError(selectedPath.path === ""
          ? "can't delete the root folder."
          : `can't delete ${selectedPath.path}. ${PATH_TYPE_STRINGS[selectedPath.type].deleteError}`)
      } else {
        confirmer.show()
      }
    }}>Delete {PATH_TYPE_STRINGS[selectedPath.type].noun}</button>
    {confirmer.confirming && <div>
      <p>
        {"you are about to delete the "}{PATH_TYPE_STRINGS[selectedPath.type].noun}{" "}{selectedPath.path}
        {selectedPath.type === PathType.Dir && " and all projects and folders inside it"}
        {". Type and press delete below to confirm."}
      </p>
      {confirmer.error.length > 0 && <p className='alert'>{confirmer.error}</p>}
      <div className="row">
        <input
          placeholder="delete"
          value={confirmer.confirmText}
          onChange={event => confirmer.setConfirmText(event.target.value)}
        />
        <button
          disabled={confirmer.confirmText !== "delete" || deleting}
          onClick={onDeleteClick}>
          {deleting ? "deleting" : "delete"}
        </button>
        <button onClick={confirmer.hide}>cancel</button>
      </div>
    </div>}
  </Modal>
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
      const { index } = action;
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
    case "delete": {
      const paths = action.paths as Set<string>;
      const nextActive = state.active.filter((it => it === state.active[selectedIndex] || !paths.has(it)));
      const selectedIndex = nextActive.findIndex(it => it === state.active[selectedIndex]);
      result = {
        selectedIndex,
        active: nextActive,
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
  const project = useContext(ProjectContext)
  const { openProject, path } = project;
  const [_, title] = splitPath(path)
  const [modalState, setModalState] = useState<ModalState>(ModalState.Closed)
  const [tabState, dispatchTabState] = useReducer(reducer, "tab-state.coglib.sosk.watch", (key) => {
    const storageResult = localStorage.getItem(key);
    if (storageResult) {
      return JSON.parse(storageResult)
    }

    const initial = {
      active: [path],
      selectedIndex: 0,
    }
    localStorage.setItem(key, JSON.stringify(initial))

    return initial
  });

  return <>
    <div className="row center">
      <strong>projects: </strong>
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
      <button onClick={() => setModalState(ModalState.Open)} title='manage projects'>
        manage projects
      </button>
      <button onClick={() => {
        const now = new Date();
        const text = serializeProject({ createdAt: now, updatedAt: now, ...project, ignoredCards: [] });
        downloadText(text, title, "md")
      }}>export {title}</button>
    </div>
    <ProjectModal
      modalState={modalState}
      setModalState={setModalState}
      dispatchTabState={dispatchTabState}
    />
  </>
}