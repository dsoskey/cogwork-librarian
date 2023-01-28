import { useLocalStorage } from '../../api/local/useLocalStorage'
import { Setter } from '../../types'

export interface DebugDetails {
  revealDetails: boolean
  setRevealDetails: Setter<boolean>
  visibleDetails: string[]
  setVisibleDetails: Setter<string[]>
}

export const useDebugDetails = (): DebugDetails => {
  const [revealDetails, setRevealDetails] = useLocalStorage(
    'reveal-details',
    false
  )
  const [visibleDetails, setVisibleDetails] = useLocalStorage(
    'visible-details',
    ['weight', 'queries']
  )

  return {
    revealDetails,
    setRevealDetails,
    visibleDetails,
    setVisibleDetails,
  }
}
