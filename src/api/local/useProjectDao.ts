import { createContext, useEffect } from 'react'
import { CardEntry, cogDB, Project, ProjectFolder } from './db'
import { useLocalStorage } from './useLocalStorage'
import { INTRO_EXAMPLE } from '../example'
import { Setter } from '../../types'
import { defaultFunction, defaultPromise } from '../context'


interface ProjectDao {
  createFolder: (path: string) => Promise<ProjectFolder>
  createProject: (path: string) => Promise<Project>
  openProject: (path: string) => Promise<Project>
  queries: string[]
  setQueries: Setter<string[]>
  currentPath: string;
}

const defaultDao: ProjectDao = {
  createFolder: defaultPromise("ProjectDao.createFolder"),
  createProject: defaultPromise("ProjectDao.createProject"),
  openProject: defaultPromise("ProjectDao.openProject"),
  queries: [],
  setQueries: defaultFunction("ProjectDao.setQueries"),
  currentPath: "",
}

// todo: move to path utility file?
export const splitPath = (path: string): [string, string] => {
  const pathParts = path.split("/");
  const projectName = pathParts.pop();
  return [pathParts.join('/'), projectName];
}

export const ProjectContext = createContext<ProjectDao>(defaultDao)

export function useProjectDao(): ProjectDao {
  const [updatedAt, _setUpdatedAt] = useLocalStorage<Date>("project.updatedAt", new Date());
  const [initialPath, setInitialPath] = useLocalStorage<string>("project.initialPath", "/project-1");
  const [currentPath, _setCurrentPath] = useLocalStorage<string>("project.currentPath", "/project-1");
  const [queries, _setQueries] = useLocalStorage<string[]>('queries', INTRO_EXAMPLE)
  const setQueries: Setter<string[]> = (q) => {
    _setQueries(q);
    _setUpdatedAt(new Date());
  }
  const [savedCards, _setSavedCards] = useLocalStorage<CardEntry[]>('project.savedCards', [])
  const [ignoredIds, _setIgnoredIds] = useLocalStorage<string[]>('ignore-list', [])
  const loadMemory = (project: Project) => {
    setInitialPath(project.path);
    _setCurrentPath(project.path);
    _setQueries(project.queries);
    _setSavedCards(project.savedCards);
    _setIgnoredIds(project.ignoredCards);
    _setUpdatedAt(project.updatedAt);
  }
  const saveMemory = async () => {
    if (initialPath !== currentPath) {
      // handle move
      // cogDB.transaction("rw", cogDB.project, cogDB.projectFolder, async () => {
        const [folder, _] = splitPath(currentPath);
        const folderExists = await cogDB.projectFolder.get(folder);
        if (!folderExists) {
          throw Error(`folder ${folder} does not exist`);
        }
        // cogDB.project.add(...);
        // cogDB.project.delete(initialPath);
      // })
    }
    // TODO: validate that i can update primary keys
    const updated = await cogDB.project.update(currentPath, {
      path: currentPath,
      queries,
      savedCards,
      ignoredCards: ignoredIds,
      updatedAt,
    })
    if (!updated) {
      await cogDB.project.add({
        path: currentPath,
        queries,
        savedCards,
        ignoredCards: ignoredIds,
        updatedAt,
        createdAt: updatedAt
      })
    }
  }

  const createFolder = async (path: string) => {
    try {
      await cogDB.projectFolder.add({ path })
    } catch (e) {
      throw Error(`a folder already exists at ${path}`)
    }
    return { path }
  }

  const createProject = async (path: string) => {
    await saveMemory();
    const [folder, _] = splitPath(path);
    const folderExists = await cogDB.projectFolder.get(folder);
    if (!folderExists) {
      throw Error(`folder ${folder} does not exist`);
    }
    const now = new Date();
    const newProject: Project = {
      path: path,
      savedCards: [],
      ignoredCards: [],
      queries: [],
      createdAt: now,
      updatedAt: now,
    }
    try {
      await cogDB.project.add(newProject);
    } catch (e) {
      throw Error(`a project already exists at ${path}`)
    }
    loadMemory(newProject);
    return newProject;
  }

  const openProject = async (path: string) => {
    await saveMemory();

    const toOpen = await cogDB.project.get(path);
    if (toOpen === undefined) {
      throw Error(`couldnt find project at path ${path}`)
    }
    loadMemory(toOpen)
    return toOpen;
  }

  useEffect(() => {
    (async () => {
      const folderCount = await cogDB.projectFolder.count();
      if (folderCount === 0) {
        await createFolder("") // root folder
      }
    })()
  }, [])

  return {
    createFolder,
    createProject,
    openProject,
    queries, setQueries,
    currentPath,
  }
}