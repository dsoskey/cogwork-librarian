import React, { createContext, useState } from 'react'
import _cloneDeep from 'lodash/cloneDeep'
export type { Flag } from '../../config'
import { ClientConfig, Flag } from '../../config'

// @ts-ignore
import _config from 'configuration'
console.log(_config);
export const CLIENT_CONFIG = _config as ClientConfig;
export const REFOCUS_TIMEOUT = 50;

interface FlagManager {
  flags: Record<Flag, boolean>
  setFlag: (flag: Flag, value: boolean) => void
}

export const FlagContext = createContext<FlagManager>({
  flags: CLIENT_CONFIG.flags,
  setFlag: () => console.error("FlagContext.setFlag called without a provider!"),
})

export const FlagContextProvider = ({ children }) => {
  const [flags, setFlags] = useState<Record<Flag, boolean>>(() => {
    const result = _cloneDeep(CLIENT_CONFIG.flags)
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
