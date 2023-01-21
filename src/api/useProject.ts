import { Setter } from '../types'
import { useLocalStorage } from './local/useLocalStorage'
import { useCallback } from 'react'

interface Project {
  savedCards: string[]
  setSavedCards: Setter<string[]>
  addCard: (name: string) => void

  ignoredIds: string[]
  // setIgnoredIds: Setter<string[]>
  addIgnoredId: (id: string) => void
  reset: () => void
}

export const useProject = (): Project => {
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
    savedCards,
    setSavedCards,
    addCard,
    ignoredIds /*, setIgnoredIds*/,
    addIgnoredId,
    reset,
  }
}
