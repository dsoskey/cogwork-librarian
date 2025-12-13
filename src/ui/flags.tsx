import React, { createContext, useMemo, useState } from 'react'
export type { Flag } from '../../config'
import { ClientConfig, Flag, Stage } from '../../config'

export const CLIENT_CONFIG: ClientConfig = {
  stage: Stage.Dev,
  flags: {
    showDebugInfo: true,
    adminMode: true,
    displayTypes: true,
    edhrecOverlay: false,
    proxyTest: true,
    searchSource: false,
    cubeCombos: false,
  }
}
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
    const result = structuredClone(CLIENT_CONFIG.flags)
    if (localStorage.getItem("admin.coglib.sosk.watch") === "~") {
      result.adminMode = true
    }
    return result
  })

  const setFlag = (flag: Flag, value: boolean) => {
    setFlags(prev => {
      const next= structuredClone(prev)
      next[flag] = value
      return next
    })
  }

  const value = useMemo(() => ({ flags, setFlag }), [flags, setFlag])

  return (
    <FlagContext.Provider value={value}>
      {children}
    </FlagContext.Provider>
  )
}
