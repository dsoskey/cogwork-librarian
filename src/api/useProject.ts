import { Setter } from '../types'
import { useLocalStorage } from './local/useLocalStorage'
import { createContext, useCallback } from 'react'
import { INTRO_EXAMPLE } from './example'

interface ProjectDao {

  savedCards: string[]
  setSavedCards: Setter<string[]>
  addCard: (name: string) => void

  ignoredIds: string[]
  // setIgnoredIds: Setter<string[]>
  addIgnoredId: (id: string) => void
  reset: () => void
  rawQueries: string[]
  setRawQueries: Setter<string[]>
  newProject: () => Promise<void>;
  loadProject: (path: string) => Promise<void>;
  saveProject: (path: string) => Promise<void>;
}

const defaultProject: ProjectDao = {
  loadProject: () => Promise.reject("ProjectDao.loadProject called without a provider!"),
  newProject: () => Promise.reject("ProjectDao.newProject called without a provider!"),
  saveProject: () => Promise.reject("ProjectDao.saveProject called without a provider!"),
  rawQueries: [],
  setRawQueries: () => console.error("Project.setSavedCards called without a provider!"),
  savedCards: [],
  setSavedCards: () => console.error("Project.setSavedCards called without a provider!"),
  addCard: () => console.error("Project.addCard called without a provider!"),
  ignoredIds: [],
  addIgnoredId: () => console.error("Project.addIgnoredId called without a provider!"),
  reset: () => console.error("Project.reset called without a provider!")
}

export const ProjectContext = createContext(defaultProject)

export const useProject = (): ProjectDao => {
  const [rawQueries, setRawQueries] = useLocalStorage<string[]>('queries', INTRO_EXAMPLE)
  const [savedCards, setSavedCards] = useLocalStorage<string[]>(
    'saved-cards',
    []
  )
  const addCard = useCallback(
    (next) =>
      setSavedCards((prev) => [...prev.filter((it) => it.length > 0), next]),
    [setSavedCards]
  )

  const [ignoredIds, setIgnoredIds] = useLocalStorage<string[]>(
    'ignore-list',
    []
  )
  const addIgnoredId = useCallback(
    (next) =>
      setIgnoredIds((prev) => [...prev.filter((it) => it.length > 0), next]),
    [setIgnoredIds]
  )

  const reset = useCallback(() => {
    setSavedCards([])
    setIgnoredIds([])
  }, [setSavedCards, setIgnoredIds])

  return {
    loadProject(path: string): Promise<void> {
      return Promise.reject("TODO")
    }, newProject(): Promise<void> {
      return Promise.reject("TODO")
    }, saveProject(path: string): Promise<void> {
      return Promise.reject("TODO")
    },
    savedCards,
    setSavedCards,
    addCard,
    ignoredIds /*, setIgnoredIds*/,
    addIgnoredId,
    reset,
    rawQueries,
    setRawQueries

  }
}
