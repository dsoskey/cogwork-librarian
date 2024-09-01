import React, { useState } from 'react'
import { Setter } from 'src/types'

export interface PageControlProps {
  pageNumber: number
  setPageNumber: Setter<number>
  // last index on page
  upperBound: number
  pageSize: number
  count: number
}

export function usePageControl(pageSize, initialPageNumber: number = 0) {
  const [pageNumber, setPageNumber] = useState<number>(initialPageNumber);
  const lowerBound = pageNumber * pageSize
  const upperBound = (pageNumber + 1) * pageSize
  return {
    pageNumber, setPageNumber,
    lowerBound, upperBound,
  }
}

export const PageControl = ({
  pageNumber,
  setPageNumber,
  pageSize,
  count,
  upperBound,
}: PageControlProps) => (
  <div className='page-numbers'>
    <button onClick={() => setPageNumber(0)} disabled={pageNumber === 0}>
      {'|<<'}
    </button>
    <button onClick={() => setPageNumber((prev) => prev - 1)} disabled={pageNumber === 0}>
      {'< previous'}
    </button>
    <button
      onClick={() => setPageNumber((prev) => prev + 1)}
      disabled={upperBound >= count}
    >{`next ${pageSize} >`}</button>
    <button
      onClick={() => setPageNumber(Math.floor(count / pageSize))}
      disabled={upperBound >= count}
    >
      {'>>|'}
    </button>
  </div>
)
