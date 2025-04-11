import React, { useEffect, useState } from 'react'
import { Setter } from 'src/types'

export interface PageControlProps {
  pageNumber: number
  setPageNumber: Setter<number>
  // last index on page
  upperBound: number
  pageSize: number
  count: number
}

export function usePageControl(pageSize: number, initialPageNumber: number = 0) {
  const [pageNumber, setPageNumber] = useState<number>(initialPageNumber);
  const lowerBound = pageNumber * pageSize
  const upperBound = (pageNumber + 1) * pageSize
  return {
    pageNumber, setPageNumber,
    lowerBound, upperBound,
  }
}

export function PageControl({
  pageNumber,
  setPageNumber,
  pageSize,
  count,
  upperBound,
}: PageControlProps) {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.shiftKey) {
        if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
          event.preventDefault()
        }
        if (event.key === "ArrowRight" && upperBound < count) {
          if (event.altKey) {
            setPageNumber(Math.ceil(count / pageSize) - 1)
          } else {
            setPageNumber((prev) => prev + 1)
          }
        }
        if (event.key === "ArrowLeft" && pageNumber > 0) {
          if (event.altKey) {
            setPageNumber(0)
          } else {
            setPageNumber((prev) => prev - 1)

          }
        }
      }
    }
    document.addEventListener("keydown", handleKeydown)
    return () => document.removeEventListener("keydown", handleKeydown)
  }, [pageNumber, pageSize, count, upperBound])

  return <div className='page-numbers'>
    <button
      title='First page. Ctrl + Alt + Shift + Left'
      onClick={() => setPageNumber(0)} disabled={pageNumber === 0}
    >
      {'|<<'}
    </button>
    <button
      title='Previous page. Ctrl + Shift + Left'
      onClick={() => setPageNumber((prev) => prev - 1)} disabled={pageNumber === 0}
    >
      {'< previous'}
    </button>
    <button
      title="Next page. Ctrl + Shift + Right"
      onClick={() => setPageNumber((prev) => prev + 1)}
      disabled={upperBound >= count}
    >{`next ${pageSize} >`}</button>
    <button
      title="Last page. Ctrl + Alt + Shift + Right"
      onClick={() => setPageNumber(Math.ceil(count / pageSize) - 1)}
      disabled={upperBound >= count}
    >
      {'>>|'}
    </button>
  </div>
}

export interface PageInfoProps {
  searchCount: number
  ignoreCount: number
  lowerBound: number
  upperBound: number
}

export function PageInfo({ ignoreCount, searchCount, lowerBound, upperBound }: PageInfoProps) {

  return <div>
    {searchCount > 0 && `${lowerBound} – ${Math.min(upperBound, searchCount)} of ${searchCount} cards`}
    {searchCount > 0 && ignoreCount > 0 && `. ignored ${ignoreCount} cards`}
    {searchCount === 0 &&
      '0 cards found. We\'ll have more details on that soon :)'}
  </div>
}