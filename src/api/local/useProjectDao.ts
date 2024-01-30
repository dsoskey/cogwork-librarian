import { createContext, useEffect, useState } from 'react'
import { cogDB, Project, ProjectFolder } from './db'
import { useLocalStorage } from './useLocalStorage'
import { INTRO_EXAMPLE } from '../example'
import { Setter } from '../../types'
import { defaultFunction, defaultPromise } from '../context'
import { Card } from 'scryfall-sdk'
import cloneDeep from 'lodash/cloneDeep'
import { CardEntry, parseEntry, serializeEntry } from './types/cardEntry'


export interface ProjectDao {
  createFolder: (path: string) => Promise<ProjectFolder>
  deleteFolder: (path: string) => Promise<void>
  createProject: (path: string) => Promise<Project>
  openProject: (path: string) => Promise<Project>
  deleteProject: (path: string) => Promise<void>
  queries: string[]
  setQueries: Setter<string[]>
  currentPath: string;
  currentLine: string;
  setCurrentLine: Setter<string>
  currentIndex: number
  setCurrentIndex: Setter<number>
  savedCards: CardEntry[]
  setSavedCards: Setter<CardEntry[]>
  addCard: (card: Card) => void;
}

const defaultDao: ProjectDao = {
  currentIndex: 0,
  currentLine: '',
  setCurrentIndex: defaultFunction("ProjectDao.setCurrentIndex"),
  setCurrentLine: defaultFunction("ProjectDao.setCurrentLine"),
  createFolder: defaultPromise("ProjectDao.createFolder"),
  deleteFolder: defaultPromise("ProjectDao.deleteFolder"),
  createProject: defaultPromise("ProjectDao.createProject"),
  openProject: defaultPromise("ProjectDao.openProject"),
  deleteProject: defaultPromise("ProjectDao.deleteProject"),
  queries: [],
  setQueries: defaultFunction("ProjectDao.setQueries"),
  savedCards: [],
  setSavedCards: defaultFunction("ProjectDao.setQueries"),
  addCard: defaultFunction("ProjectDao.addCard"),
  currentPath: ""
}

// todo: move to path utility file?
export const splitPath = (path: string): [string, string] => {
  const pathParts = path.split("/");
  const projectName = pathParts.pop();
  return [pathParts.join('/'), projectName];
}

export const ProjectContext = createContext<ProjectDao>(defaultDao)

function keepUpdated<S>(setter: Setter<S>, updateSetter: Setter<Date>) {
  const inner: Setter<S> = (prev) => {
    setter(prev);
    updateSetter(new Date());
  }
  return inner
}
export function useProjectDao(): ProjectDao {
  const [updatedAt, _setUpdatedAt] = useLocalStorage<Date>("project.updatedAt", new Date());
  const [initialPath, setInitialPath] = useLocalStorage<string>("project.initialPath", "/my-project");
  const [currentPath, _setCurrentPath] = useLocalStorage<string>("project.currentPath", "/my-project");
  const [queries, _setQueries] = useLocalStorage<string[]>('queries', INTRO_EXAMPLE)
  const [savedCards, _setSavedCards] = useLocalStorage<CardEntry[]>('project.savedCards', [{ name: "" }])
  const [currentIndex, setCurrentIndex] = useState<number | undefined>(
    savedCards.length ? 0 : undefined
  )
  const [currentLine, setCurrentLine] = useState<string | undefined>(
    savedCards.length
      ? serializeEntry(savedCards[0])
      : undefined
  )

  const [ignoredIds, _setIgnoredIds] = useLocalStorage<string[]>('ignore-list', [])
  const loadMemory = (project: Project) => {
    setInitialPath(project.path);
    _setCurrentPath(project.path);
    _setQueries(project.queries);
    _setSavedCards(project.savedCards);
    if (currentIndex < project.savedCards.length) {
      setCurrentLine(serializeEntry(project.savedCards[currentIndex]))
    } else {
      setCurrentLine(serializeEntry(project.savedCards[0]))
      setCurrentIndex(0)
    }
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
    const savedCopy = cloneDeep(savedCards);
    savedCopy[currentIndex] = parseEntry(currentLine);
    // TODO: validate that i can update primary keys
    const updated = await cogDB.project.update(currentPath, {
      path: currentPath,
      queries,
      savedCards: savedCopy,
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

  const deleteFolder = async (path: string) => {
    await cogDB.transaction("rw", cogDB.projectFolder, cogDB.project, () => {
      cogDB.projectFolder.delete(path);
      cogDB.project.where("path").startsWith(path).delete()
    })
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
      savedCards: [{ name: "" }],
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

  const deleteProject = async (path: string) => {
    await cogDB.project.delete(path);
  }

  useEffect(() => {
    (async () => {
      const folderCount = await cogDB.projectFolder.count();
      if (folderCount === 0) {
        await createFolder("") // root folder
      }
      const projectCount = await cogDB.projectFolder.count();
      if (projectCount === 0) {
        await createProject(currentPath)
        await saveMemory()
      }
    })()
  }, [])

  const setSavedCards = keepUpdated(_setSavedCards, _setUpdatedAt)
  const addCard = (card: Card) => {
    setSavedCards((prev) => {
      const next = cloneDeep(prev);
      next.push({ name: card.name })
      return next;
    })
  }

  return {
    createFolder,
    deleteFolder,
    createProject,
    openProject,
    deleteProject,
    queries, setQueries: keepUpdated(_setQueries, _setUpdatedAt),
    savedCards, setSavedCards, addCard,
    currentPath,
    currentLine, setCurrentLine,
    currentIndex, setCurrentIndex,
  }
}