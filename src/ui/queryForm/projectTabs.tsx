import React, { useContext, useReducer, useState } from 'react'
import { ProjectContext, splitPath } from '../../api/local/useProjectDao'
import './projectTabs.css'
import { downloadText } from '../download'
import { serializeProject } from '../../api/local/types/project'
import { ModalState, ProjectModal } from './projectModal'

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