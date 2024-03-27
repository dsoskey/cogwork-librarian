import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card, NormedCard, QueryRunner, SearchError, SortFunctions } from 'mtgql'
import { cogDB as cogDBClient } from '../api/local/db'
import { CardImageView } from './cardBrowser/cardViews/cardImageView'
import { groupBy, sortBy } from 'lodash'
import './cubeView.css'
import { Input } from './component/input'
import { CUBE_SOURCE_TO_LABEL, cubeLink } from './component/cube/sourceIcon'
import { Modal } from './component/modal'
import { RefreshButton } from './component/cube/refreshButton'
import { ScryfallIcon } from './component/scryfallIcon'


interface OrderedCard extends Card {
  index: number
}

function isCreature(card: OrderedCard): number {
  if (card.type_line.includes("Creature")) return 0
  return 1
}

export function CubeView() {
  const { key } = useParams();
  const cube = useLiveQuery(() => cogDBClient.getCube(key), [key]);
  const needsMigration = cube && cube.cards === undefined;
  const [oracles, setOracles] = useState<{ [key: string]: NormedCard[] }>({})
  const [cards, setCards] = useState<OrderedCard[]>([])
  const [error, setError] = useState<SearchError | undefined>()
  const [filterQuery, setFilterQuery] = useState<string>("")
  const [filteredCards, setFilteredCards] = useState<OrderedCard[] | undefined>();
  const sorted: OrderedCard[] = useMemo(() => {
    return sortBy(
      filteredCards ?? cards,
      [SortFunctions.byColorId, 'cmc', isCreature, 'type_line', 'name'],
    ) as OrderedCard[]
  }, [filteredCards, cards])
  const [activeCard, setActiveCard] = useState<OrderedCard | undefined>();
  const applyFilter = () => {
    const qr = new QueryRunner({ corpus: cards, dataProvider: cogDBClient })
    qr.search(filterQuery)
      // This technically works with OrderedCard because the query runner spreads its props.
      // @ts-ignore
      .map(setFilteredCards)
      .mapErr(setError)
    return [];
  };
  const clearFilter = () => setFilteredCards(undefined);

  useEffect(() => {
    const funk = async() => {
      try {
        const next: OrderedCard[] = [];
        const newOracles = (await cogDBClient.card.bulkGet(cube.cards.map(it=>it.oracle_id))) ?? [];
        const oracleIdToNormed = groupBy(newOracles, "oracle_id")
        setOracles(oracleIdToNormed);
        if (needsMigration) {
          const cards = newOracles.map(it => ({ oracle_id: it.oracle_id, print_id: it.printings[0].id }));
          await cogDBClient.cube.put({
            ...cube,
            cards
          });
        } else {
          const printToCard: { [key: string]: Card } = {};
          for (const normCard of newOracles) {
            for (const print of normCard.printings) {
              printToCard[print.id] = {...normCard, ...print};
            }
          }

          for (let i = 0; i < cube.cards.length; i++) {
            const printId = cube.cards[i].print_id
            if (printId in printToCard) {
              next.push({ ...printToCard[printId], index: i });
            }
          }

          setCards(next);
        }

        } catch (e) {
        console.error(e)
      }
    };
    if (cube !== undefined)
      funk().catch(console.error);
  }, [cube])

  const onPrintSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const normedCard = oracles[activeCard.oracle_id][0]
    const nextPrint = normedCard.printings.find(p => p.id === e.target.value)
    setActiveCard({...activeCard, ...nextPrint})
  }

  const saveActiveCard = () => {
    if (activeCard && cube.cards[activeCard.index].print_id !== activeCard.id) {
      const cards = [
        ...cube.cards.slice(0, activeCard.index),
        { oracle_id: activeCard.oracle_id, print_id: activeCard.id },
        ...cube.cards.slice(activeCard.index + 1)
      ];
      const newCube = {
        ...cube,
        cards,
      }
      cogDBClient.cube.put(newCube)
        .then(() => setActiveCard(undefined))
        .catch(console.error)
    } else {
      setActiveCard(undefined)
    }
  }

  return <>
    <div className='cube-view-root'>
      <div className='header'>
        <h2>{cube?.key ?? "loading..."}</h2>
        {error && <div className="alert">{error.message}</div>}
        {cube && <>
          {<div>a {cube.cards?.length ?? cube.print_ids?.length ?? cube.oracle_ids.length} card cube</div>}
          <div className='baseline row'><strong>source:</strong>
            {cube.source !== "list" && <>
              <a href={cubeLink(cube)}
                 rel='noreferrer'
                 target='_blank'>
                {CUBE_SOURCE_TO_LABEL[cube.source]}
              </a>
              <RefreshButton toSubmit={[cube]} />
            </>}
            {cube.source === "list" && "a text list"}
          </div>
          <div><strong>last updated:</strong> {cube.last_updated.toLocaleString() ?? "~"}</div>
        </>}
        <div className="row center">
          <Input language="scryfall" value={filterQuery} onChange={e => setFilterQuery(e.target.value)} />
          <button onClick={applyFilter} disabled={filterQuery.length === 0}>Apply filter</button>
          <button onClick={clearFilter} disabled={filteredCards === undefined}>Clear filter</button>
        </div>
        {cube && filteredCards && <div>filter matched {filteredCards.length} of {cube.print_ids.length}</div>}
      </div>
      {cards.length === 0 && error === undefined && <div>loading cards...</div>}
      {sorted.length > 0 && error === undefined && <div className='result-container'>
        <div className="card-image-container">
          {sorted.map((card, index) =>
            <CardImageView
              key={card.id + index.toString()}
              className={"_8"}
              card={{ data: card, matchedQueries: [`cube:${key}`], weight: 1 }}
              onClick={() => setActiveCard(card)}
            />)}
        </div>
      </div>}
    </div>
    <Modal
      open={activeCard !== undefined}
      title={<div className="row center">
        <h2>{activeCard?.name} –</h2>
        <a href={activeCard?.scryfall_uri.replace(/\?.+$/, "")}
           rel='noreferrer'
           target='_blank'
           title="view on scryfall "
        ><ScryfallIcon size="1.5em" /></a>
      </div>}
      onClose={() => setActiveCard(undefined)}>
      {activeCard && <>
          <CardImageView card={{ data: activeCard, matchedQueries: [`cube:${key}`], weight: 1 }} />
          <div>
            <select value={activeCard.id} onChange={onPrintSelect}>
              {oracles[activeCard.oracle_id][0]
                .printings.map(printing =>
                  <option key={printing.id} value={printing.id}>
                    {printing.set_name} – ({printing.set} {printing.collector_number})
                  </option>)}
            </select>
            <button onClick={saveActiveCard}>save</button>
        </div>
      </>}
    </Modal>
  </>
}