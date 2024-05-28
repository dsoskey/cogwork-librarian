import { Card, NormedCard } from 'mtgql'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { CogDBContext } from '../../api/local/useCogDB'
import { CogCubeDefinition, cogDB as cogDBClient, Manifest } from '../../api/local/db'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router'
import { useKeyValList } from '../hooks/useKeyValList'
import _groupBy from 'lodash/groupBy'
import { useLiveQuery } from 'dexie-react-hooks'
import { Setter } from '../../types'

export interface OrderedCard extends Card {
  index: number
}

function LoadingError({ cardCount, refreshCubeCards }) {
  const { loadManifest, memStatus, dbStatus } = useContext(CogDBContext)

  const onClick = async () => {
    await loadManifest({ type: 'default_cards' } as Manifest, ['db', 'memory'], '')
    await refreshCubeCards()
  }

  return <div className='alert'>
    Your local database is missing {cardCount} cards.{' '}
    <Link to='/data/card'>Go to data</Link> to refresh your database then load this page again or
    {' '}
    <button disabled={memStatus === 'loading' || dbStatus === 'loading'} onClick={onClick}>load default database
    </button>
  </div>
}

export interface CubeViewModel {
  cube: CogCubeDefinition | undefined | null
  cards: OrderedCard[]
  loadingError: React.ReactNode,
  oracleList: NormedCard[]
  oracleMap: { [k: string]: NormedCard[] }
  activeCard: OrderedCard | undefined
  setActiveCard: Setter<OrderedCard | undefined>
}

export function useCubeViewModel(): CubeViewModel {
  const { key } = useParams()
  const { dbStatus, bulkCardByOracle, bulkCardByCubeList } = useContext(CogDBContext)
  const [loadingError, setLoadingError] = useState<React.ReactNode>(undefined)
  const [cards, setCards] = useState<OrderedCard[]>([])
  const [oracleList, oracleMap, setOracles] = useKeyValList<NormedCard>(list => _groupBy(list, 'oracle_id'))
  const [activeCard, setActiveCard] = useState<OrderedCard | undefined>();

  // highly cursed, don't do this lol
  const cube = useLiveQuery(() => cogDBClient.getCube(key), [key, dbStatus], null)
  const needsMigration = cube && cube.cards === undefined
  const refreshCubeCards = async () => {
    try {
      if (needsMigration) {
        const newOracles = await bulkCardByOracle(cube.oracle_ids)
        setOracles(newOracles)

        const cards = newOracles.map(it => ({ oracle_id: it.oracle_id, print_id: it.printings[0].id }))
        await cogDBClient.cube.put({
          ...cube,
          cards
        })
      } else {
        const newOracles = await bulkCardByCubeList(cube.cards)
        setOracles(newOracles)

        const printToCard: { [key: string]: Card } = {}
        for (const normCard of newOracles) {
          for (const print of normCard.printings) {
            printToCard[print.id] = { ...normCard, ...print }
          }
        }

        const missingPrints = []
        const next: OrderedCard[] = []
        for (let i = 0; i < cube.cards.length; i++) {
          const printId = cube.cards[i].print_id
          if (printId in printToCard) {
            next.push({ ...printToCard[printId], index: i })
          } else {
            missingPrints.push(printId)
          }
        }

        if (missingPrints.length) {
          setLoadingError(<LoadingError
            cardCount={missingPrints.length}
            refreshCubeCards={refreshCubeCards}
          />)

        } else {
          setCards(next)
        }
      }
      setLoadingError(undefined)
    } catch (e) {
      console.error(e)
      if (Array.isArray(e)) {
        setLoadingError(<LoadingError
          cardCount={e.length}
          refreshCubeCards={refreshCubeCards}
        />)
      } else {
        setLoadingError(<div className='alert'>
          {e.message}
        </div>)
      }
    }
  }

  useEffect(() => {
    if (cube) refreshCubeCards().catch(console.error)
  }, [cube, dbStatus])

  return {
    cards, cube, loadingError,
    oracleList, oracleMap,
    activeCard, setActiveCard,
  }
}

export const CubeViewModelContext = createContext<CubeViewModel>({} as CubeViewModel)