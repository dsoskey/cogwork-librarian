import { Setter } from '../../types'
import { ExplorerCtx, FileExplorer, Path, PATH_TYPE_STRINGS, PathType, RESERVED_PATH, SELECT_ALL } from './fileExplorer'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'
import React, { useContext, useState } from 'react'
import { ProjectContext, splitPath } from '../../api/local/useProjectDao'
import { useConfirmDelete } from './useConfirmDelete'
import { parseProject, Project, serializeProject } from '../../api/local/types/project'
import { downloadText } from '../download'
import { Modal } from '../component/modal'
import { FormField } from '../component/formField'

const ProjectExplorer = (props: ExplorerCtx) => {
  const projects = useLiveQuery(() => cogDB.project.toArray())
  const projectFolders = useLiveQuery(() => cogDB.projectFolder.toArray())

  if (projectFolders === undefined || projects === undefined)
    return <div>loading project info...</div>

  const projectPaths = projects.map(it => it.path)
  const folderPaths = projectFolders.map(it => it.path)
  return <FileExplorer filePaths={projectPaths} dirPaths={folderPaths} {...props} />
}

export enum ModalState {
  Closed, New, Open
}

interface ProjectModalProps {
  modalState: ModalState
  setModalState: Setter<ModalState>
  dispatchTabState: (any) => void
}

export const ProjectModal = ({ modalState, setModalState, dispatchTabState }: ProjectModalProps) => {
  const project = useContext(ProjectContext)

  const [error, setError] = useState<string>('')
  const [projectToSubmit, setProjectToSubmit] = useState<string>('my-project')
  const [selectedPath, setSelectedPath] = useState<Path>({ path: '', type: PathType.Dir })
  const [createDirParent, setCreateDirParent] = useState<string | undefined>(undefined)
  const [newDir, setNewDir] = useState<string>('')
  const confirmer = useConfirmDelete()
  const [deleting, setDeleting] = useState<boolean>(false)
  const onDeleteClick = () => {
    if (selectedPath.path === '') {
      setError('cant fully delete root, only clear its contents')
      return
    }
    setDeleting(true)
    let func: (path: string) => Promise<Set<string>>
    switch (selectedPath.type) {
      case PathType.Dir:
        func = project.deleteFolder
        break
      case PathType.File:
        func = project.deleteProject
    }
    func(selectedPath.path)
      .then(paths => {
        console.log(paths, 'have been deleted. you should do something about it')
        dispatchTabState({ type: 'delete', paths })
        confirmer.hide()
      })
      .catch(e => confirmer.setError(e.message))
      .finally(() => setDeleting(false))
  }
  const onCreateFolderClick = () => {
    const toSubmit = newDir.trim()
    if (toSubmit.length === 0) {
      setError('empty folder name')
      return
    } else if (toSubmit.includes('/')) {
      setError('folder can\'t include \'/\'')
      return
    } else if (toSubmit === RESERVED_PATH) {
      setError(`${RESERVED_PATH} is a reserved name; choose something else`)
      return
    } else {
      setError('')
    }
    const path = `${createDirParent}/${toSubmit}`
    project.createFolder(path)
      .then(() => {
        setCreateDirParent(undefined)
        setNewDir('')
      })
      .catch(e => {
        console.error(e)
        setError(e.message)
      })
  }

  let canCreateProject = selectedPath?.type === PathType.Dir
  const onCreateProjectClick = () => {
    const toSubmit = projectToSubmit.trim()
    if (toSubmit.length === 0) {
      setError('empty project name')
      return
    } else if (toSubmit.includes('/')) {
      setError('project name can\'t include \'/\'')
      return
    } else if (toSubmit === RESERVED_PATH) {
      setError(`${RESERVED_PATH} is a reserved name; choose something else`)
      return
    } else {
      setError('')
    }
    const path = `${selectedPath.path}/${toSubmit}`
    project.newProject(path)
      .then((project) => {
        setModalState(ModalState.Closed)
        dispatchTabState({ type: 'new', path: project.path })
      })
      .catch(e => {
        console.error(e)
        setError(e.message)
      })
  }

  let canOpenProject = selectedPath?.type === PathType.File
  const onOpenClick = () => {
    project.openProject(selectedPath.path)
      .then((project) => {
        setModalState(ModalState.Closed)
        dispatchTabState({ type: 'open', path: project.path })
      })
      .catch(console.error)
  }

  const onExportClick = async () => {
    let toExport: Project
    if (selectedPath.path === project.path) {
      const now = new Date()
      toExport = { ...project, ignoredCards: [], createdAt: now, updatedAt: now }
    } else {
      toExport = await cogDB.project.get(selectedPath.path)
    }

    if (toExport) {
      downloadText(
        serializeProject(toExport),
        splitPath(selectedPath.path)[1],
        'md'
      )
    }
  }

  const onImportClick = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files[0];
    const rawProject = await file.text();
    const toImport = parseProject(
      rawProject,
      `${selectedPath.path}${projectToSubmit}`,
      new Date(file.lastModified)
    )
    try {
      await project.importProject(toImport);
      setModalState(ModalState.Closed)
      dispatchTabState({ type: 'open', path: toImport.path })
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  }

  return <Modal
    open={modalState !== ModalState.Closed}
    title={<h2>Manage projects</h2>}
    onClose={() => {
      confirmer.hide()
      setModalState(ModalState.Closed)
      setError('')
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
      title='Project name'
      description={<>
        projects must be uniquely named within their folder.
        used for new projects and imported projects without a path
      </>}>
      {<input
        value={projectToSubmit}
        disabled={!canCreateProject}
        onChange={e => setProjectToSubmit(e.target.value)}
      />}
    </FormField>
    {error && <div className='alert'>{error}</div>}
    <button onClick={onCreateProjectClick} disabled={!canCreateProject}>Create project</button>
    <label className={`file-label button-like ${canCreateProject ? "" : "disabled"}`}>
      <span>Import project</span>
      <input disabled={!canCreateProject} type='file' accept='.md' onChange={onImportClick} />
    </label>
    <button disabled={!canOpenProject} onClick={onOpenClick}>Open project</button>
    <button disabled={!canOpenProject} onClick={onExportClick}>Export project</button>
    <button onClick={() => {
      if (project.path.startsWith(selectedPath.path)) {
        setError(selectedPath.path === ''
          ? 'can\'t delete the root folder.'
          : `can't delete ${selectedPath.path}. ${PATH_TYPE_STRINGS[selectedPath.type].deleteError}`)
      } else {
        confirmer.show()
      }
    }}>Delete {PATH_TYPE_STRINGS[selectedPath.type].noun}</button>
    {confirmer.confirming && <div>
      <p>
        {'you are about to delete the '}{PATH_TYPE_STRINGS[selectedPath.type].noun}{' '}{selectedPath.path}
        {selectedPath.type === PathType.Dir && ' and all projects and folders inside it'}
        {'. Type and press delete below to confirm.'}
      </p>
      {confirmer.error.length > 0 && <p className='alert'>{confirmer.error}</p>}
      <div className='row'>
        <input
          placeholder='delete'
          value={confirmer.confirmText}
          onChange={event => confirmer.setConfirmText(event.target.value)}
        />
        <button
          disabled={confirmer.confirmText !== 'delete' || deleting}
          onClick={onDeleteClick}>
          {deleting ? 'deleting' : 'delete'}
        </button>
        <button onClick={confirmer.hide}>cancel</button>
      </div>
    </div>}
  </Modal>
}