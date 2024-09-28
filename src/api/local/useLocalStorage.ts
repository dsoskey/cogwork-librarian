// Shamelessly stolen from https://usehooks.com/useLocalStorage/

import { useState } from 'react'

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

  // Return a wrapped version of useState's setter function that ...
  // ... persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value
      // Save state
      setStoredValue(valueToStore)
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(
          `${key}.coglib.sosk.watch`,
          JSON.stringify(valueToStore)
        )
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.log(error)
    }
  }

  return [storedValue, setValue] as const
}
