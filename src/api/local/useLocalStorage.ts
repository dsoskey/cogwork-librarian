// Shamelessly stolen from https://usehooks.com/useLocalStorage/

import { useEffect, useState } from 'react'

export const useLocalStorage = <T>(
  key: string,
  initialValue: T | (() => T),
  construct: (arg: T) => T = (i) => i
) => {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    const lazyVal = () =>
      initialValue instanceof Function ? initialValue() : initialValue
    if (typeof window === 'undefined') {
      return lazyVal()
    }

    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(`${key}.coglib.sosk.watch`)
      // Parse stored json or if none return initialValue
      const result = item ? construct(JSON.parse(item)) : lazyVal()
      window.localStorage.setItem(
        `${key}.coglib.sosk.watch`,
        JSON.stringify(result)
      )
      return result
    } catch (error) {
      // If error also return initialValue
      console.log(error)
      return lazyVal()
    }
  })

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(
        `${key}.coglib.sosk.watch`,
        JSON.stringify(storedValue)
      )
    }
  }, [storedValue])

  return [storedValue, setStoredValue] as const
}
