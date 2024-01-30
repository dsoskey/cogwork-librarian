import { useLocalStorage } from './local/useLocalStorage'
import { useCallback } from 'react'

interface IgnoreList {
  ignoredIds: string[]
  // setIgnoredIds: Setter<string[]>
  addIgnoredId: (id: string) => void
}

export const useIgnoreList = (): IgnoreList => {
  const [ignoredIds, setIgnoredIds] = useLocalStorage<string[]>(
    'ignore-list',
    []
  )
  const addIgnoredId = useCallback(
    (next) =>
      setIgnoredIds((prev) => [...prev.filter((it) => it.length > 0), next]),
    [setIgnoredIds]
  )

  return {
    ignoredIds /*, setIgnoredIds*/,
    addIgnoredId,
  }
}
