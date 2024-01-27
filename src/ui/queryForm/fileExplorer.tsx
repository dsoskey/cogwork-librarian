import React, { createContext, useContext, useState } from 'react'
import "./fileExplorer.css"
import { Setter } from '../../types'
import { defaultFunction } from '../../api/context'

export const RESERVED_PATH = ".path"
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
  onPathSelected: Setter<string>
  selectedPath: string
  selectable: Set<Selectable>
  canCreateDir?: boolean
  createNewDir: () => void
  createDirParent: string | undefined
  setCreateDirParent: Setter<string | undefined>
  newDir: string
  setNewDir: Setter<string>
}
const ExplorerContext = createContext<ExplorerCtx>({
  canCreateDir: false,
  createNewDir:defaultFunction("ExplorerContext.createNewDir"),
  createDirParent: '',
  newDir: '',
  onPathSelected: defaultFunction("ExplorerContext.onPathSelected"),
  selectable: undefined,
  selectedPath: '',
  setCreateDirParent: defaultFunction("ExplorerContext.setCreateDirParent"),
  setNewDir: defaultFunction("ExplorerContext.setNewDir")
})

interface ExplorerLeafProps {
  path: string
  text: string
}
const ExplorerLeaf = ({ path, text }: ExplorerLeafProps) => {
  const { onPathSelected, selectedPath, selectable } = useContext(ExplorerContext)
  const canSelect = selectable.has(Selectable.File);
  const onClick = () => {
    if (canSelect) {
      onPathSelected(path)
    }
  }
  return <li onClick={onClick} className={`project ${canSelect ? "selectable": "" } ${selectedPath === path ? "inverted" : ""}`}>{text}</li>
}

interface ExplorerBranchProps {
  tree: any
  text: string
}
const ExplorerBranch = ({ tree, text }: ExplorerBranchProps) => {
  const { onPathSelected, selectedPath, selectable, canCreateDir,
    createDirParent, setCreateDirParent, newDir, setNewDir, createNewDir,
  } = useContext(ExplorerContext)
  const { [RESERVED_PATH]: path, ...rest } = tree;
  const keys = Object.keys(rest);
  const [open, setOpen] = useState<boolean>(text === "")
  const canSelect = selectable.has(Selectable.Dir)
  const isCreateDirParent = path === createDirParent;
  const onClick = () => {
    if (canSelect) {
      onPathSelected(path)
    }
  }
  return <li>
    <span onClick={onClick} className={`folder ${canSelect ? "selectable": "" } ${selectedPath === path ? "inverted" : ""}`}>
      {text}/&nbsp;
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

enum Selectable { File, Dir }
export const SELECT_FILE = new Set([Selectable.File])
export const SELECT_DIR = new Set([Selectable.Dir])
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