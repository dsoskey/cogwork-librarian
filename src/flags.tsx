import React, { createContext } from 'react'
import { ObjectValues } from './types'

const FLAG_NAMES = {
  showDebugInfo: 'showDebugInfo',
} as const
type Flag = ObjectValues<typeof FLAG_NAMES>

export const INITIAL_FLAGS = {
  showDebugInfo: false,
}

export const FlagContext = createContext<Record<Flag, boolean>>(INITIAL_FLAGS)

export const FlagContextProvider = ({ children }) => {
  return (
    <FlagContext.Provider value={INITIAL_FLAGS}>
      {children}
    </FlagContext.Provider>
  )
}
