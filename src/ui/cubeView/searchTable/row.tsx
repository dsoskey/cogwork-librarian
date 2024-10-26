import { ColorBreakdown } from '../cubeTags'
import React, { useEffect, useRef, useState } from 'react'
import { Card, SearchError, SearchOptions } from 'mtgql'
import { useHighlightPrism } from '../../../api/local/syntaxHighlighting'
import { Modal } from '../../component/modal'
import { OrderedCard } from '../useCubeViewModel'
import { Input } from '../../component/input'
import { ResultAsync } from 'neverthrow'
import { Dictionary } from 'lodash'
import { getColors } from './tempColorUtil'

export interface ShownQuery {
  query: string
  cards: OrderedCard[]
}

interface CubeSearchRowProps {
  query: string
  setQuery: (query: string) => void
  searchCards: (query: string, searchOptions: SearchOptions) => ResultAsync<Card[], SearchError>
  total: number
  onKeyDown: any
  flop: boolean
  cardCounts: Dictionary<OrderedCard[]>
  setCardsToShow: (cards: ShownQuery) => void;
  showPercentages: boolean
}

export function CubeSearchRow({
  flop,
  onKeyDown,
  query,
  setQuery,
  searchCards,
  total,
  cardCounts,
  setCardsToShow,
  showPercentages
}: CubeSearchRowProps) {
  const [result, setResult] = useState<OrderedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<SearchError | undefined>()
  const timeout = useRef<number>()

  const runSearch = async (q) => {
    if (total === 0) return

    setError(undefined)
    try {
      const searchResult = await searchCards(q, { order: 'cmc' })
      searchResult
        .map(it => setResult(it as OrderedCard[]))
        .mapErr(error => {
          console.error(error)
          setError(error)

        })
    } catch (error) {
      console.error(error)
      setError(error)
    } finally {
      setLoading(false)
    }
  }

  const handleCellClick = (colorKey: string) => {
    if (loading) return

    const cards = colorKey === 'total'
      ? { query, cards: result }
      : {
        query: `${query} c=${colorKey}`, cards: result.filter(it => {
          const colors = getColors(it)
          switch (colorKey) {
            case 'c':
              return colors.length === 0
            case 'm':
              return colors.length >= 2
            default:
              return colors.length === 1 && colors[0].toLowerCase() === colorKey
          }
        })
      }

    setCardsToShow(cards)
  }

  useEffect(() => {
    clearTimeout(timeout.current)
    timeout.current = undefined
    runSearch(query)
  }, [flop, searchCards])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value)
    clearTimeout(timeout.current)
    // @ts-ignore
    timeout.current = setTimeout(() => {
      runSearch(event.target.value)
      timeout.current = undefined
    }, 1500)
  }

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      clearTimeout(timeout.current)
      runSearch(query)
    }
    onKeyDown(event)
  }

  const buckets: ColorBreakdown = result.reduce((acc, card) => {
    let key: string
    const colors = getColors(card)
    if (colors === undefined || colors.length === 0) {
      key = 'c'
    } else if (colors.length > 1) {
      key = 'm'
    } else {
      key = colors[0].toLowerCase()
    }
    acc[key] += cardCounts[card.oracle_id]?.length ?? 1
    acc.total += cardCounts[card.oracle_id]?.length ?? 1
    return acc
  }, { tag: query, w: 0, u: 0, b: 0, r: 0, g: 0, m: 0, c: 0, total: 0 })

  return <ColorBreakdownRow
    onCellClick={handleCellClick}
    error={error}
    loading={loading}
    breakdown={buckets}
    total={total}
    showPercentages={showPercentages}
    isSubTotal>
    <Input
      className='search-row-input'
      language='scryfall-extended-multi'
      value={query}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
    />
  </ColorBreakdownRow>
}

interface ColorBreakdownRowProps {
  loading?: boolean
  breakdown: ColorBreakdown
  total: number
  isSubTotal?: boolean
  children: React.ReactNode
  error?: SearchError
  onCellClick: (colorKey: string) => void;
  showPercentages: boolean
}

export function ColorBreakdownRow({
  onCellClick,
  error,
  loading,
  breakdown,
  total,
  isSubTotal,
  showPercentages,
  children
}: ColorBreakdownRowProps) {
  const [open, setOpen] = useState(false)
  useHighlightPrism([breakdown.tag])

  const denominator = total > 0 ? total : 1
  return <tr className={loading ? 'loading' : ''}>
    {open && <Modal open={open} title={`${error.type} error`} onClose={() => setOpen(false)}>
      <pre className='language-none'><code>{error.message}</code></pre>
    </Modal>}
    <td className='row center'>
      {children}
      {error && <button className='error-indicator' onClick={() => setOpen(true)}
      >⚠️</button>}
    </td>
    <td onClick={() => onCellClick('total')}>{breakdown.total}
      {isSubTotal && showPercentages &&
        <span className='percentage'>{' ('}{(breakdown.total / total * 100).toPrecision(2)}%)</span>}
    </td>
    <td onClick={() => onCellClick('w')} className='w'>
      {breakdown.w}
      {showPercentages &&
        <span className='percentage'>{" "}({(breakdown.w / denominator * 100).toPrecision(2)}%)</span>
      }</td>
    <td onClick={() => onCellClick('u')} className='u'>
      {breakdown.u}
      {showPercentages &&
        <span className='percentage'>{" "}({(breakdown.u / denominator * 100).toPrecision(2)}%)</span>
      }</td>
    <td onClick={() => onCellClick('b')} className='b'>
      {breakdown.b}
      {showPercentages &&
        <span className='percentage'>{" "}({(breakdown.b / denominator * 100).toPrecision(2)}%)</span>
      }</td>
    <td onClick={() => onCellClick('r')} className='r'>
      {breakdown.r}
      {showPercentages &&
        <span className='percentage'>{" "}({(breakdown.r / denominator * 100).toPrecision(2)}%)</span>
      }</td>
    <td onClick={() => onCellClick('g')} className='g'>
      {breakdown.g}
      {showPercentages &&
        <span className='percentage'>{" "}({(breakdown.g / denominator * 100).toPrecision(2)}%)</span>
      }</td>
    <td onClick={() => onCellClick('m')} className='m'>
      {breakdown.m}
      {showPercentages &&
        <span className='percentage'>{" "}({(breakdown.m / denominator * 100).toPrecision(2)}%)</span>
      }</td>
    <td onClick={() => onCellClick('c')} className='c'>
      {breakdown.c}
      {showPercentages &&
        <span className='percentage'>{" "}({(breakdown.c / denominator * 100).toPrecision(2)}%)</span>
      }</td>
  </tr>
}