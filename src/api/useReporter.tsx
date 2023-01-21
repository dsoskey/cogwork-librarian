import React, { useCallback, useState } from 'react'

type Timepoint = 'start' | 'end'
export interface QueryReport {
  totalQueries: number
  setTotalQueries: React.Dispatch<React.SetStateAction<number>>
  complete: number
  addComplete: (arg?: number) => void
  error: number
  addError: (arg?: number) => void
  totalCards: number
  setTotalCards: React.Dispatch<React.SetStateAction<number>>
  cardCount: number
  addCardCount: (arg?: number) => void
  reset: (q: number) => void
  start: number
  end: number
  markTimepoint: (moment: Timepoint) => void
}

export const useReporter = (): QueryReport => {
  const [start, setStart] = useState<number | undefined>()
  const [end, setEnd] = useState<number | undefined>()
  const [totalQueries, setTotalQueries] = useState(0)
  const [complete, setComplete] = useState(0)
  const addComplete = useCallback(
    (c = 1) => setComplete((prev) => prev + c),
    [setComplete]
  )
  const [error, setError] = useState(0)
  const addError = useCallback(
    (c = 1) => setError((prev) => prev + c),
    [setError]
  )
  const [cardCount, setCardCount] = useState(0)
  const [totalCards, setTotalCards] = useState(0)
  const addCardCount = useCallback(
    (c = 1) => setCardCount((prev) => prev + c),
    [setCardCount]
  )
  const reset = (q: number) => {
    setTotalQueries(q)
    setComplete(0)
    setError(0)
    setTotalCards(0)
    setCardCount(0)
    setStart(Date.now())
    setEnd(undefined)
  }
  const markTimepoint = (t: Timepoint) => {
    if (t === 'start') {
      setStart(Date.now())
    } else if (t === 'end') {
      setEnd(Date.now())
    }
  }

  return {
    totalQueries,
    setTotalQueries,
    complete,
    addComplete,
    error,
    addError,
    setTotalCards,
    totalCards,
    cardCount,
    addCardCount,
    reset,
    markTimepoint,
    start,
    end,
  }
}
