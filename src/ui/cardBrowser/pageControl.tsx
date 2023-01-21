import React from 'react'
import { Setter } from 'src/types'

export interface PageControlProps {
  page: number
  setPage: Setter<number>
  // last index on page
  upperBound: number
  pageSize: number
  cardCount: number
}

export const PageControl = ({
  page,
  setPage,
  pageSize,
  cardCount,
  upperBound,
}: PageControlProps) => (
  <div className='page-numbers'>
    <button onClick={() => setPage(0)} disabled={page === 0}>
      {'|<<'}
    </button>
    <button onClick={() => setPage((prev) => prev - 1)} disabled={page === 0}>
      {'< previous'}
    </button>
    <button
      onClick={() => setPage((prev) => prev + 1)}
      disabled={upperBound >= cardCount}
    >{`next ${pageSize} >`}</button>
    <button
      onClick={() => setPage(Math.floor(cardCount / pageSize))}
      disabled={upperBound >= cardCount}
    >
      {'>>|'}
    </button>
  </div>
)
