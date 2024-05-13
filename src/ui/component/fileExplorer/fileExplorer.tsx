import React, { createContext, useContext, useState } from 'react'
import "./fileExplorer.css"
import { Setter } from '../../../types'
import { defaultFunction } from '../../../api/context'
import { useEditablePath } from './editablePath'

export const RESERVED_PATH = ".path"
export enum PathType { File, Dir }
export const PATH_TYPE_STRINGS = {
  [PathType.File]: {
    noun: "project",
    deleteError: "It's the active project. Switch to a different project before deleting this one."
  },
  [PathType.Dir]: {
    noun: "folder",
    deleteError: "It contains the active project. Switch to a different project before deleting this folder."
  },
}
export interface Path {
  path: string
  type: PathType
}
export function buildTree(dirs: string[], projs: string[]): Object {
  const result = {}
  for (const dir of dirs) {
    const split = dir.split("/")
    let current = result;
    for (let i = 0; i < split.length; i++){
      const key = split[i]
      const path = split.slice(0, i+1).join("/");
      current[key] = current[key] ?? { [RESERVED_PATH]: path };
      current = current[key];
    }
  }
  for (const proj of projs) {
    const split = proj.split("/")
    let current = result;
    for (let i = 0; i < split.length - 1; i++){
      const key = split[i]
      current[key] = current[key] ?? {};
      current = current[key];
    }
    current[split[split.length-1]] = proj
  }
  return result;
}

export interface ExplorerCtx {
  onPathSelected: Setter<Path>
  selectedPath: Path
  selectable: Set<PathType>
  canCreateDir?: boolean
  createNewDir: () => void
  moveProject: (oldPath: string, newName: string) => void
  moveFolder: (oldPath: string, newName: string) => void
  createDirParent: string | undefined
  setCreateDirParent: Setter<string | undefined>
  newDir: string
  setNewDir: Setter<string>
}
const ExplorerContext = createContext<ExplorerCtx>({
  canCreateDir: false,
  createNewDir: defaultFunction("ExplorerContext.createNewDir"),
  moveProject: defaultFunction("ExplorerContext.moveProject"),
  moveFolder: defaultFunction("ExplorerContext.moveFolder"),
  createDirParent: '',
  newDir: '',
  onPathSelected: defaultFunction("ExplorerContext.onPathSelected"),
  selectable: undefined,
  selectedPath: { path: '', type: PathType.File },
  setCreateDirParent: defaultFunction("ExplorerContext.setCreateDirParent"),
  setNewDir: defaultFunction("ExplorerContext.setNewDir")
})

interface ExplorerLeafProps {
  path: string
  text: string
}
const ExplorerLeaf = ({ path, text }: ExplorerLeafProps) => {
  const { onPathSelected, selectedPath, selectable, moveProject } = useContext(ExplorerContext)
  const canSelect = selectable.has(PathType.File);
  const isSelected = selectedPath?.path === path;
  const { pathEditor, editing, editButton } = useEditablePath({ path, text, isSelected, updatePath: moveProject });
  const onClick = () => {
    if (canSelect && !isSelected) {
      onPathSelected({ path, type: PathType.File });
    }
  }

  return <li className={`project ${editing ? "editing" : ""} ${canSelect ? "selectable": "" } ${isSelected ? "inverted" : ""}`}
    title="click to select"
    onClick={onClick}
  >
    {(!editing || !isSelected) && text}
    {isSelected && !editing && editButton}
    {isSelected && editing && pathEditor}
  </li>
}

interface ExplorerBranchProps {
  tree: any
  text: string
}
const ExplorerBranch = ({ tree, text }: ExplorerBranchProps) => {
  const { onPathSelected, selectedPath, selectable, canCreateDir,
    createDirParent, setCreateDirParent, newDir, setNewDir, createNewDir,
    moveFolder,
  } = useContext(ExplorerContext)
  const { [RESERVED_PATH]: path, ...rest } = tree;
  const keys = Object.keys(rest);
  const [open, setOpen] = useState<boolean>(text === "")

  const canSelect = selectable.has(PathType.Dir)
  const isCreateDirParent = path === createDirParent;
  const isSelected = selectedPath?.path === path;
  const { pathEditor, editing, editButton } = useEditablePath({ path, text, isSelected, updatePath: moveFolder });

  const onClick = () => {
    if (canSelect && !isSelected) {
      onPathSelected({ path, type: PathType.Dir })
    }
  }

  return <li>
    <span onClick={onClick} className={`folder ${editing ? "editing" : ""} ${canSelect ? "selectable": "" } ${isSelected ? "inverted" : ""}`}>
      {(!editing || !isSelected) && `${text}/ `}
      {isSelected && !editing && editButton}
      {isSelected && editing && pathEditor}
      {keys.length > 0 && <button
        title={open ? `collapse ${path}` : `expand ${path}`}
        onClick={e => {
          e.stopPropagation();
          setOpen(prev=>!prev)
        }}>
        {open ? "V" : ">" }
      </button>}
      {canCreateDir && <button
        title={isCreateDirParent ? "stop creating folder": `create folder${path.length ? ` in ${path}` : ""}`}
        onClick={() => {
          setCreateDirParent(isCreateDirParent ? undefined : path)
          setOpen(true)
        }}>
        {isCreateDirParent ? "↩":"+"}
      </button>}
    </span>
    {(keys.length > 0 || isCreateDirParent) && <ul className={open ? "" : "none"}>
      {isCreateDirParent && <li>
        <input placeholder='enter a folder name' value={newDir} onChange={e => setNewDir(e.target.value)} />
        &nbsp;
        <button onClick={createNewDir}>create folder</button>
      </li>}
      {keys.map(key =>
        typeof tree[key] === 'string'
          ? <ExplorerLeaf key={key} text={key} path={tree[key]} />
          : <ExplorerBranch key={key} text={key} tree={tree[key]} />
      )}
    </ul>}
  </li>
}


export const SELECT_FILE = new Set([PathType.File])
export const SELECT_DIR = new Set([PathType.Dir])
export const SELECT_ALL = new Set([PathType.File, PathType.Dir])
interface FileExplorerProps extends ExplorerCtx {
  dirPaths: string[]
  filePaths: string[]
}

export const FileExplorer = ({ dirPaths, filePaths, ...ctx }: FileExplorerProps) => {
  const tree = buildTree(dirPaths, filePaths)

  return <ExplorerContext.Provider value={ctx}>
    <ul className='file-explorer'>
      {Object.keys(tree).map(key => <ExplorerBranch key={key} text={key} tree={tree[key]} />)}
    </ul>
  </ExplorerContext.Provider>
}