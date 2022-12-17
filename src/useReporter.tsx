import React, { useCallback, useState } from "react"

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
}

export const useReporter = (): QueryReport => {
    const [totalQueries, setTotalQueries] = useState(0)
    const [complete, setComplete] = useState(0)
    const addComplete = useCallback((c = 1) => setComplete(prev => prev + c), [setComplete])
    const [error, setError] = useState(0)
    const addError = useCallback((c = 1) => setError(prev => prev + c), [setError])
    const [cardCount, setCardCount] = useState(0)
    const [totalCards, setTotalCards] = useState(0)
    const addCardCount = useCallback((c = 1) => setCardCount(prev => prev + c), [setCardCount])
    const reset = useCallback((q) => {
        setTotalQueries(q)
        setComplete(0)
        setError(0)
        setTotalCards(0)
        setCardCount(0)
    }, [])

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
    }
}