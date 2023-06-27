import React, { createContext, useState } from 'react'
import { ObjectValues } from './types'
import _cloneDeep from 'lodash/cloneDeep'
import { ClientConfig, Stage } from '../config'

// @ts-ignore
import _config from 'configuration';
console.log(_config);
export const clientConfig = _config as ClientConfig;
export const FLAG_NAMES = {
  adminMode: 'adminMode',
  showDebugInfo: 'showDebugInfo',
  disableCache: 'disableCache',
  displayTypes: 'displayTypes',
  multiQuery: 'multiQuery'
} as const
export type Flag = ObjectValues<typeof FLAG_NAMES>

export const INITIAL_FLAGS: Record<Flag, boolean> = {
  showDebugInfo: clientConfig.stage === Stage.Dev,
  adminMode: false,
  disableCache: true,
  displayTypes: false,
  multiQuery: clientConfig.stage === Stage.Dev,
}

interface FlagManager {
  flags: Record<Flag, boolean>
  setFlag: (flag: Flag, value: boolean) => void
}
export const FlagContext = createContext<FlagManager>({
  flags: INITIAL_FLAGS,
  setFlag: () => console.error("FlagContext.setFlag called without a provider!"),
})

export const FlagContextProvider = ({ children }) => {
  const [flags, setFlags] = useState<Record<Flag, boolean>>(() => {
    const result = _cloneDeep(INITIAL_FLAGS)
    if (localStorage.getItem("admin.coglib.sosk.watch") === "~") {
      result.adminMode = true
    }
    return result
  })

  const setFlag = (flag: Flag, value: boolean) => {
    setFlags(prev => {
      prev[flag] = value
      return _cloneDeep(prev)
    })
  }

  return (
    <FlagContext.Provider value={{ flags, setFlag }}>
      {children}
    </FlagContext.Provider>
  )
}
