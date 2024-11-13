import React, { useContext, useReducer, useState } from 'react'
import { ProjectContext, splitPath } from '../../api/local/useProjectDao'
import './projectTabs.css'
import { downloadText } from '../download'
import { serializeProject } from '../../api/local/types/project'
import { ModalState, ProjectModal } from './projectModal'
import cloneDeep from 'lodash/cloneDeep'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { InfoModal } from '../component/infoModal'

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
    {!editing && <div title={path}>{project}</div>}
  </div>
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
    case "rename": {
      for (const change of action.paths) {
        const { oldPath, newPath } = change;
        const selectedIndex = state.active.findIndex(it => it === oldPath);
        if (selectedIndex > -1) {
          state.active[selectedIndex] = newPath;
        }
      }
      result = cloneDeep(state)
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
  const [oldIgnoreIds, setOldIgnoreIds] = useLocalStorage("ignore-list", []);
  const { setIgnoredIds } = useContext(ProjectContext);
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
    <div className="row center wrap">
      <span className="bold">projects: </span>
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
      <div>
        <button onClick={() => setModalState(ModalState.Open)} title='manage projects'>
          manage projects
        </button>
        <button onClick={() => {
          const now = new Date();
          const text = serializeProject({ createdAt: now, updatedAt: now, ...project, ignoredCards: [] });
          downloadText(text, title, "md")
        }}>export {title}</button>
      </div>
      {oldIgnoreIds.length > 0 && <InfoModal
        buttonContent="migrate ignore-list"
        info={<>
         <p>Instead of a single global ignore-list, each project now has its own ignore-list. You've used the global ignore-list feature in the past. Permanently move global ignore-list to the current project?</p>
         <button onClick={() => {
           setIgnoredIds(oldIgnoreIds)
           setOldIgnoreIds([])
         }}>do migration</button>
        </>}
        title={<h2>Migrate ignore-list</h2>}
      />}
    </div>
    <ProjectModal
      modalState={modalState}
      setModalState={setModalState}
      dispatchTabState={dispatchTabState}
    />
  </>
}