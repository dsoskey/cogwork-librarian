import { useCallback, useState } from 'react'
import { Setter } from '../../types'

interface UseConfirmDelete {
  confirming: boolean
  show: () => void;
  hide: () => void;
  confirmText: string
  setConfirmText: Setter<string>
  error: string
  setError: Setter<string>
}
export function useConfirmDelete(): UseConfirmDelete {
  const [confirming, setConfirming] = useState<boolean>(false);
  const show = useCallback(() => setConfirming(true), [setConfirming])
  const [confirmText, setConfirmText] = useState<string>("");
  const [error, setError] = useState<string>("")
  const hide = useCallback(() => {
    setConfirming(false)
    setConfirmText("");
  }, [setConfirming, setConfirmText]);

  return {
    confirming, show, hide,
    error, setError,
    confirmText, setConfirmText,
  }
}