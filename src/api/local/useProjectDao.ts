import React, { createContext, useCallback, useEffect, useMemo, useState } from 'react'
import { cogDB, ProjectFolder } from './db'
import { useLocalStorage } from './useLocalStorage'
import { INTRO_EXAMPLE } from '../example'
import { Setter } from '../../types'
import { defaultFunction, defaultPromise } from '../context'
import { Card } from 'mtgql'
import cloneDeep from 'lodash/cloneDeep'
import { Project, SavedCardSection } from './types/project'
import { parseEntry, serializeEntry } from './types/cardEntry'


export interface ProjectDao {
  createFolder: (path: string) => Promise<ProjectFolder>
  // returns paths that were deleted.
  deleteFolder: (path: string) => Promise<Set<string>>
  newProject: (path: string) => Promise<Project>
  importProject: (project: Project) => Promise<Project>
  openProject: (path: string) => Promise<Project>
  moveProject: (oldPath: string, newPath: string) => Promise<void>,
  moveFolder: (oldPath: string, newPath: string) => Promise<string[]>
  // returns paths that were deleted.
  deleteProject: (path: string) => Promise<Set<string>>
  queries: string[]
  setQueries: Setter<string[]>
  path: string;
  savedCards: SavedCardSection[]
  setSavedCards: Setter<SavedCardSection[]>
  ignoredIds: string[]
  setIgnoredIds: Setter<string[]>
  toggleIgnoreId: (id: string) => void;

  addCard: (query: string, card: Card) => void;
  renameQuery: (queryIndex: number, newQuery: string) => void;
  removeCard: (queryIndex: number, cardIndex: number) => void;
  removeQuery: (queryIndex: number) => void;
}

const defaultDao: ProjectDao = {
  ignoredIds: [],
  toggleIgnoreId: defaultFunction("ProjectDao.toggleIgnoreId"),
  setIgnoredIds: defaultFunction("ProjectDao.setIgnoredIds"),
  createFolder: defaultPromise("ProjectDao.createFolder"),
  deleteFolder: defaultPromise("ProjectDao.deleteFolder"),
  newProject: defaultPromise("ProjectDao.newProject"),
  importProject: defaultPromise("ProjectDao.importProject"),
  openProject: defaultPromise("ProjectDao.openProject"),
  deleteProject: defaultPromise("ProjectDao.deleteProject"),
  moveProject: defaultPromise("ProjectDao.moveProject"),
  moveFolder: defaultPromise("ProjectDao.moveFolder"),
  queries: [],
  setQueries: defaultFunction("ProjectDao.setQueries"),
  savedCards: [],
  setSavedCards: defaultFunction("ProjectDao.setQueries"),
  addCard: defaultFunction("ProjectDao.addCard"),
  renameQuery: defaultFunction("ProjectDao.renameQuery"),
  removeCard: defaultFunction("ProjectDao.removeCard"),
  removeQuery: defaultFunction("ProjectDao.removeQuery"),
  path: ""
}

// todo: move to path utility file?
export const splitPath = (path: string): [string, string] => {
  const pathParts = path.split("/");
  const projectName = pathParts.pop();
  return [pathParts.join('/'), projectName];
}

export const ProjectContext = createContext<ProjectDao>(defaultDao)

function keepUpdated<S>(setter: Setter<S>, updateSetter: Setter<Date>) {
  const inner: Setter<S> = React.useCallback((prev) => {
    setter(prev);
    updateSetter(new Date());
  }, [setter, updateSetter]);
  return inner
}
export function useProjectDao(): ProjectDao {
  const [updatedAt, _setUpdatedAt] = useLocalStorage<Date>("project.updatedAt", new Date());
  const [initialPath, setInitialPath] = useLocalStorage<string>("project.initialPath", "/my-project");
  const [currentPath, _setCurrentPath] = useLocalStorage<string>("project.currentPath", "/my-project");
  const [queries, _setQueries] = useLocalStorage<string[]>('queries', INTRO_EXAMPLE)
  const [savedCards, _setSavedCards] = useLocalStorage<SavedCardSection[]>(
    'project.savedCards',
    [{ query: "*", cards: []}],
    (sections) => {
      // localhost migration
      if (Array.isArray(sections) && sections.length > 0 && !("query" in sections[0])) {
        return [{
          query: "*",
          cards: sections as unknown as string[],
        }];
      } else if (Array.isArray(sections)) {
        if (typeof sections[0].cards[0] === 'object') {
          return sections.map(it => ({
            ...it,
            // @ts-ignore
            cards: it.cards.map(serializeEntry),
            selected: false,
          }))
        }
        return sections.map(it => ({...it, selected: false }))
      }
      return sections;
    }
  );
  const [ignoredIds, setIgnoredIds] = useLocalStorage<string[]>('project.ignore-list', [])
  const toggleIgnoreId = useCallback(
    (next: string) =>
      setIgnoredIds((prev) => {
        if (prev.includes(next)) {
          return prev.filter(it => it !== next && it.length > 0);
        }
        return [...prev.filter((it) => it.length > 0), next]
      }),
    [setIgnoredIds]);

  const loadMemory = useCallback((project: Project) => {
    setInitialPath(project.path);
    _setCurrentPath(project.path);
    _setQueries(project.queries);
    _setSavedCards(project.savedCards);
    setIgnoredIds(project.ignoredCards);
    _setUpdatedAt(project.updatedAt);
  }, [
    setInitialPath,
    _setCurrentPath, _setQueries, _setSavedCards,
    setIgnoredIds, _setUpdatedAt
  ])
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
    const savedCopy = savedCards.map(it => ({...it,selected: false}));
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
        savedCards: savedCopy,
        ignoredCards: ignoredIds,
        updatedAt,
        createdAt: updatedAt
      })
    }
  }


  // todo: handle the current project being deleted.
  const deleteFolder = useCallback(async (path: string) => {
    if (initialPath.startsWith(path)) {
      throw Error(`Can't delete ${path} with active project ${initialPath}. switch to a different project to proceed`)
    }
    const deleted: Set<string> = new Set();
    await cogDB.transaction("rw", cogDB.projectFolder, cogDB.project, async () => {
      await cogDB.projectFolder.where("path").startsWith(path).delete();
      const projectsToDelete = await cogDB.project.where("path").startsWith(path);
      projectsToDelete.each(it => {
        deleted.add(it.path)
      });
      projectsToDelete.delete()
    })

    return deleted;
  }, [initialPath]);

  const _createProject = useCallback(async (project: Project) => {
    await saveMemory();
    const { path } = project;
    const [folder, _] = splitPath(path);
    const folderExists = await cogDB.projectFolder.get(folder);
    if (!folderExists) {
      throw Error(`folder ${folder} does not exist`);
    }
    try {
      await cogDB.project.add(project);
    } catch (e) {
      throw Error(`a project already exists at ${path}`)
    }
    loadMemory(project);
    return project;
  }, [saveMemory, loadMemory]);

  const newProject = useCallback(async (path: string) => {
    const now = new Date();
    const newProject: Project = {
      path: path,
      savedCards: [],
      ignoredCards: [],
      queries: [],
      createdAt: now,
      updatedAt: now,
    }
    return _createProject(newProject);
  }, [_createProject]);
  const importProject = useCallback(async (project: Project) => {
    const folderParts = project.path.split("/")
    folderParts.pop();
    const toCreate: ProjectFolder[] = [];
    let currentPath = folderParts[0];
    for (let i = 1; i < folderParts.length; i++){
      const part = folderParts[i]
      if (part === "") {
        throw Error("Invalid path. Only root folder name can be an empty string")
      }
      currentPath = `${currentPath}/${part}`;
      toCreate.push({ path: currentPath });
    }
    await cogDB.projectFolder.bulkPut(toCreate);
    return _createProject(project);
  }, [_createProject])

  const openProject = useCallback(async (path: string) => {
    await saveMemory();

    const toOpen = await cogDB.project.get(path);
    if (toOpen === undefined) {
      throw Error(`couldnt find project at path ${path}`)
    }
    loadMemory(toOpen)
    return toOpen;
  }, [saveMemory, loadMemory])

  const moveProject = useCallback(async (oldPath: string, newPath: string) => {
    if (oldPath === newPath) throw Error("can't move path to itself")
    if (oldPath === initialPath) {
      await saveMemory();
    }

    try {
      const result = await cogDB.project.update(oldPath, { path: newPath });
      if (result === 0) console.warn(`${oldPath} not found`);
    } catch (e) {
      throw Error(`There already is a project at ${newPath}`)
    }

    if (oldPath === initialPath) {
      setInitialPath(newPath);
      _setCurrentPath(newPath);
    }
  }, [initialPath, saveMemory, setInitialPath, _setCurrentPath]);

  const moveFolder = useCallback(async (oldPath: string, newPath: string) => {
    if (oldPath === newPath) throw Error("can't move path to itself")
    if (initialPath.startsWith(oldPath)) {
      await saveMemory();
    }

    let changed = []

    await cogDB.transaction("rw", cogDB.project, cogDB.projectFolder, async() => {
      try {
        await cogDB.projectFolder.update(oldPath, { path: newPath });
      } catch (e) {
        throw Error(`There already is a folder at ${newPath}`)
      }
      cogDB.project.where("path").startsWith(`${oldPath}/`).modify(prev => {
        //replaced string starts with /
        const newProjectPath = `${newPath}${prev.path.replace(oldPath, "")}`
        changed.push({ oldPath: prev.path, newPath: newProjectPath })
        prev.path = newProjectPath
      })
    })

    if (initialPath.startsWith(oldPath)) {
      setInitialPath(prev => `${newPath}${prev.replace(oldPath, '')}`);
      _setCurrentPath(prev => `${newPath}${prev.replace(oldPath, '')}`);
    }

    return changed
  }, [initialPath, saveMemory, setInitialPath, _setCurrentPath])

  // todo: handle the current project being deleted.
  const deleteProject = useCallback(async (path: string) => {
    if (path === initialPath) {
      throw Error("can't delete the active project. switch to a different one first.")
    }
    await cogDB.project.delete(path);
    return new Set([path]);
  }, [initialPath]);

  const setSavedCards = keepUpdated(_setSavedCards, _setUpdatedAt)

  const addCard = useCallback((query: string, card: Card) => {
    setSavedCards((prev) => {
      const next = cloneDeep(prev);
      let sectionIndex = next.findIndex(it => it.query===query)
      if (sectionIndex === -1) {
        sectionIndex = prev.length;
        next.push({ query, cards: [] });
      }
      const cardIndex = next[sectionIndex].cards.findIndex(it => it.includes(card.name));
      if (cardIndex === -1) {
        // todo: settings for which details get added
        next[sectionIndex].cards.push(serializeEntry({ name: card.name, quantity: 1, set: card.set, cn: card.collector_number }))
      } else {
        const existingEntry = parseEntry(next[sectionIndex].cards[cardIndex])
        existingEntry.quantity = (existingEntry.quantity ?? 1) + 1;
        next[sectionIndex].cards[cardIndex] = serializeEntry(existingEntry);
      }
      return next;
    })
  }, [setSavedCards]);

  const renameQuery = useCallback((queryIndex: number, newQuery: string) => {
    setSavedCards(prev => {
      if (queryIndex < 0 || queryIndex > prev.length - 1) return prev;
      if (prev[queryIndex].query === newQuery) return prev;

      const next = cloneDeep(prev);

      next[queryIndex].query = newQuery;
      return next;
    })
  }, [setSavedCards]);

  const removeCard = useCallback((queryIndex: number, cardIndex: number) => {
    setSavedCards(prev => {
      if (queryIndex < 0 || queryIndex > prev.length - 1) return prev;

      const next = cloneDeep(prev);
      next[queryIndex].cards.splice(cardIndex, 1);
      return next;
    })
  }, [setSavedCards]);

  const removeQuery = useCallback((queryIndex: number) => {
    setSavedCards(prev => {
      if (queryIndex < 0 || queryIndex > prev.length - 1) return prev;

      const next = cloneDeep(prev);
      next.splice(queryIndex, 1)
      return next;
    })
  }, [setSavedCards]);

  useEffect(() => {
    (async () => {
      const folderCount = await cogDB.projectFolder.count();
      if (folderCount === 0) {
        await createFolder("") // root folder
      }
      const projectCount = await cogDB.project.count();
      if (projectCount === 0) {
        await newProject(currentPath)
        const raw = localStorage.getItem('saved-cards.coglib.sosk.watch')
        if (raw) {
          const oldSavedCards = JSON.parse(raw).map(it => ({ name: it }))
          setSavedCards(oldSavedCards);
        }
        await saveMemory()
      }
    })()
  }, [])

  return {
    createFolder,
    deleteFolder,
    newProject,
    importProject,
    openProject,
    deleteProject,
    moveProject,
    moveFolder,
    queries, setQueries: keepUpdated(_setQueries, _setUpdatedAt),
    savedCards,
    setSavedCards, addCard, renameQuery, removeCard, removeQuery,
    path: currentPath,
    ignoredIds, toggleIgnoreId, setIgnoredIds
  }
}

async function createFolder(path: string) {
  try {
    await cogDB.projectFolder.add({ path })
  } catch (e) {
    throw Error(`a folder already exists at ${path}`)
  }
  return { path }
}