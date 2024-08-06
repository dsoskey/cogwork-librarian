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
      setIgnoredIds((prev) => {
        if (prev.includes(next)) {
          return prev.filter(it => it !== next && it.length > 0);
        }
        return [...prev.filter((it) => it.length > 0), next]
      }),
    [setIgnoredIds]
  )

  return {
    ignoredIds /*, setIgnoredIds*/,
    addIgnoredId,
  }
}
