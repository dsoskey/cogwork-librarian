import React, { useState } from 'react'
import "./fileExplorer.css"
import { Setter } from '../../types'

const buildTree = (dirs: string[], projs: string[]) => {
  const result = {}
  for (const dir of dirs) {
    const split = dir.split("/")
    let current = result;
    for (const key of split) {
      current[key] = current[key] ?? {};
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

const ExplorerLeaf = ({ path, text, onPathSelected, selectedPath }) => {
  return <li onClick={() => onPathSelected(path)} className={`project ${selectedPath === path ? "inverted" : ""}`}>{text}</li>
}
const ExplorerBranch = ({ tree, text, onPathSelected, selectedPath }) => {
  const keys = Object.keys(tree);
  const [open, setOpen] = useState<boolean>(text === "")
  return <li>
    {text}/&nbsp;
    {keys.length > 0 && <>
      <button
        onClick={() => setOpen(prev=>!prev)}>
        {open ? "V" : ">" }
      </button>
      <ul className={open ? "" : "none"}>
        {keys.map(key =>
          typeof tree[key] === 'string'
            ? <ExplorerLeaf key={key} text={key} path={tree[key]}
                            onPathSelected={onPathSelected} selectedPath={selectedPath} />
            : <ExplorerBranch key={key} text={key} tree={tree[key]}
                              onPathSelected={onPathSelected} selectedPath={selectedPath} />
        )}
      </ul>
    </> }
  </li>
}

interface FileExplorerProps {
  dirPaths: string[]
  filePaths: string[]
  selectedPath: string
  onPathSelected: Setter<string>
}

export const FileExplorer = ({ dirPaths, filePaths, onPathSelected, selectedPath }: FileExplorerProps) => {
  const tree = buildTree(dirPaths, filePaths)
  console.log(tree);

  return <ul className='file-explorer'>
    {Object.keys(tree).map(key =>
      <ExplorerBranch
        key={key} text={key} tree={tree[key]}
        onPathSelected={onPathSelected} selectedPath={selectedPath} />
    )}
  </ul>
}