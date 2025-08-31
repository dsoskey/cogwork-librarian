import { ColorBreakdown } from '../cubeTags'
import React, { HTMLProps, useEffect, useRef, useState } from 'react'
import { Card, SearchError, SearchOptions } from 'mtgql'
import { useHighlightPrism } from '../../../api/local/syntaxHighlighting'
import { Modal } from '../../component/modal'
import { OrderedCard } from '../useCubeViewModel'
import { Input } from '../../component/input'
import { Dictionary } from 'lodash'
import { getColors } from './tempColorUtil'

export enum CellDisplayMode {
  simple,
  perentage,
  asfan,
}

export const CELLS: Record<CellDisplayMode, string> = {
  [CellDisplayMode.simple]: 'count only',
  [CellDisplayMode.perentage]: 'percentage',
  [CellDisplayMode.asfan]: 'as-fan'
}

export interface ShownQuery {
  query: string
  cards: OrderedCard[]
}

interface CubeSearchRowProps {
  query: string
  setQuery: (query: string) => void
  searchCards: (query: string, searchOptions: SearchOptions) => Promise<Card[]>
  total: number
  onKeyDown: any
  flop: boolean
  setCardsToShow: (cards: ShownQuery) => void;
  cellDisplayMode: CellDisplayMode
  packSize: number
}

export function CubeSearchRow({
  flop,
  onKeyDown,
  query,
  setQuery,
  searchCards,
  total,
  setCardsToShow,
  cellDisplayMode,
  packSize
}: CubeSearchRowProps) {
  const [result, setResult] = useState<OrderedCard[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<SearchError | undefined>()
  const timeout = useRef<number>()

  const runSearch = async (q) => {
    if (total === 0) return

    setError(undefined)
    try {
      const searchResult = await searchCards(`${q} ++`, { order: 'cmc' })
      setResult(searchResult as OrderedCard[])
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

  const handleKeyDown = (event: React.KeyboardEvent) => {
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
    acc[key]++;
    acc.total++;
    return acc
  }, { tag: query, w: 0, u: 0, b: 0, r: 0, g: 0, m: 0, c: 0, total: 0 })

  return <ColorBreakdownRow
    onCellClick={handleCellClick}
    error={error}
    loading={loading}
    breakdown={buckets}
    total={total}
    cellDisplayMode={cellDisplayMode}
    packSize={packSize}
    isSubTotal>
    <Input
      className='search-row-input'
      language='mtgql-cube'
      value={query}
      placeholder="*"
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
  cellDisplayMode: CellDisplayMode
  packSize: number
}

export function ColorBreakdownRow({
  onCellClick,
  error,
  loading,
  breakdown,
  total,
  isSubTotal,
  cellDisplayMode,
  packSize,
  children
}: ColorBreakdownRowProps) {
  const [open, setOpen] = useState(false)

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
    <ColorBreakdownCell
      onClick={() => onCellClick('total')}
      numerator={breakdown.total}
      denominator={denominator}
      cellDisplayMode={isSubTotal ? cellDisplayMode : CellDisplayMode.simple}
      packSize={packSize}
    />
    <ColorBreakdownCell
      onClick={() => onCellClick('w')} className='w'
      numerator={breakdown.w}
      denominator={denominator}
      cellDisplayMode={cellDisplayMode}
      packSize={packSize}
    />
    <ColorBreakdownCell
      onClick={() => onCellClick('u')} className='u'
      numerator={breakdown.u}
      denominator={denominator}
      cellDisplayMode={cellDisplayMode}
      packSize={packSize}
    />
    <ColorBreakdownCell
      onClick={() => onCellClick('b')} className='b'
      numerator={breakdown.b}
      denominator={denominator}
      cellDisplayMode={cellDisplayMode}
      packSize={packSize}
    />
    <ColorBreakdownCell
      onClick={() => onCellClick('r')} className='r'
      numerator={breakdown.r}
      denominator={denominator}
      cellDisplayMode={cellDisplayMode}
      packSize={packSize}
    />
    <ColorBreakdownCell
      onClick={() => onCellClick('g')} className='g'
      numerator={breakdown.g}
      denominator={denominator}
      cellDisplayMode={cellDisplayMode}
      packSize={packSize}
    />
    <ColorBreakdownCell
      onClick={() => onCellClick('m')} className='m'
      numerator={breakdown.m}
      denominator={denominator}
      cellDisplayMode={cellDisplayMode}
      packSize={packSize}
    />
    <ColorBreakdownCell
      onClick={() => onCellClick('c')} className='c'
      numerator={breakdown.c}
      denominator={denominator}
      cellDisplayMode={cellDisplayMode}
      packSize={packSize}
    />
  </tr>
}

interface ColorBreakdownCellProps extends HTMLProps<HTMLTableCellElement>{
  numerator: number
  denominator: number
  cellDisplayMode: CellDisplayMode
  packSize: number
}

function ColorBreakdownCell({ numerator, denominator, cellDisplayMode, packSize, ...rest }: ColorBreakdownCellProps) {
  return <td {...rest}>
    {numerator}
    {cellDisplayMode === CellDisplayMode.simple && null}
    {cellDisplayMode === CellDisplayMode.perentage &&
      <span className='percentage'>
        {` (${numerator === denominator ? "100" :  (numerator / denominator * 100).toPrecision(2)}%)`}
      </span>}
    {cellDisplayMode === CellDisplayMode.asfan &&
      <span className='percentage'>
        {` (${(numerator / denominator * packSize||0).toFixed(1)})`}
      </span>}
  </td>;
}