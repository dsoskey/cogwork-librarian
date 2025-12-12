import { Card, CubeCard, Cube, NormedCard } from 'mtgql'
import React, { createContext, useContext, useEffect, useState } from 'react'
import { CogDBContext } from '../../api/local/useCogDB'
import { cogDB as cogDBClient, Manifest } from '../../api/local/db'
import { Link } from 'react-router-dom'
import { useParams } from 'react-router'
import { useKeyValList } from '../hooks/useKeyValList'
import _groupBy from 'lodash/groupBy'
import { useLiveQuery } from 'dexie-react-hooks'
import { Setter } from '../../types'
import { CardToIllustrationTag, CardToOracleTag } from '../../api/local/types/tags'
import { CARD_INDEX } from '../../api/local/cardIndex'
import { Alert } from '../component/alert/alert'

export interface OrderedCard extends Card, Omit<CubeCard, "name"|"cmc"|"colors"|"rarity"> {
  index: number
}

function LoadingError({ cardCount, refreshCubeCards }) {
  const { loadManifest, memStatus, dbStatus } = useContext(CogDBContext)

  const onClick = async () => {
    await loadManifest({ type: 'default_cards' } as Manifest, ['db', 'memory'], '')
    await refreshCubeCards()
  }

  return <Alert>
    Your local database is missing {cardCount} cards.{' '}
    <Link to='/data/card'>Go to data</Link> to refresh your database then load this page again or
    {' '}
    <button disabled={memStatus === 'loading' || dbStatus === 'loading'} onClick={onClick}>load default database
    </button>
  </Alert>
}

export interface CubeViewModel {
  cube: Cube | undefined | null
  otags: CardToOracleTag[] | undefined | null
  itags: CardToIllustrationTag[] | undefined | null
  cards: OrderedCard[]
  loadingError: React.ReactNode,
  oracleList: NormedCard[]
  oracleMap: { [k: string]: NormedCard[] }
  activeCard: OrderedCard | undefined
  setActiveCard: Setter<OrderedCard | undefined>
}

export function useCubeViewModel(): CubeViewModel {
  const { key } = useParams()
  const { dbStatus } = useContext(CogDBContext)
  const [loadingError, setLoadingError] = useState<React.ReactNode>(undefined)
  const [cards, setCards] = useState<OrderedCard[]>([])
  const [oracleList, oracleMap, setOracles] = useKeyValList<NormedCard>(list => _groupBy(list, 'oracle_id'))
  const [activeCard, setActiveCard] = useState<OrderedCard | undefined>();

  // highly cursed, don't do this lol
  const cube = useLiveQuery(() => {
    if (dbStatus === "success")
      return cogDBClient.getCube(key)
    return null
  }, [key, dbStatus], null)
  const otags = useLiveQuery(() =>
    cards.length === 0 ? null :
    cogDBClient.cardToOtag.bulkGet(cards.map(it => it.oracle_id)), [cards])
  const itags = useLiveQuery(() =>
    cards.length === 0 ? null :
      cogDBClient.cardToItag.bulkGet(cards.map(it => it.illustration_id)), [cards])
  const needsMigration = cube && cube.cards === undefined
  const refreshCubeCards = async () => {
    try {
      if (needsMigration) {
        const newOracles = await CARD_INDEX.bulkCardByOracle(cube.oracle_ids)
        setOracles(newOracles)

        const cards = newOracles.map(it => ({ oracle_id: it.oracle_id, print_id: it.printings[0].id }))
        await cogDBClient.cube.put({
          ...cube,
          cards
        })
      } else {
        const newOracles = await CARD_INDEX.bulkCardByCubeList(cube.cards)
        setOracles(newOracles)

        const printToCard: { [key: string]: Card } = {}
        for (const normCard of newOracles) {
          for (const print of normCard.printings) {
            printToCard[print.id] = { ...normCard, ...print }
          }
        }

        const missingPrints = []
        const next: OrderedCard[] = []
        let byOracle;
        for (let i = 0; i < cube.cards.length; i++) {
          const card = cube.cards[i];
          const printId = cube.cards[i].print_id
          if (printId in printToCard) {
            next.push({
              ...printToCard[printId],
              ...card,
              index: i })
          } else {
            if (byOracle === undefined) {
              byOracle = _groupBy(newOracles, "oracle_id");
            }
            missingPrints.push(printId)
            const defaultOracleCard = byOracle[card.oracle_id][0]
            next.push({
              ...defaultOracleCard,
              ...defaultOracleCard.printings[0],
              index: i,
            })
          }
        }
        setCards(next)
      }
    } catch (e) {
      console.error(e)
      if (Array.isArray(e)) {
        setLoadingError(<LoadingError
          cardCount={e.length}
          refreshCubeCards={refreshCubeCards}
        />)
      } else {
        setLoadingError(<Alert>{e.message}</Alert>)
      }
    }
  }

  useEffect(() => {
    if (cube && dbStatus === "success") refreshCubeCards().catch(console.error)
  }, [cube, dbStatus])

  return {
    cards, cube, loadingError,
    oracleList, oracleMap, otags, itags,
    activeCard, setActiveCard,
  }
}

export const CubeViewModelContext = createContext<CubeViewModel>({} as CubeViewModel)