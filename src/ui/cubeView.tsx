import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { Card, NormedCard, QueryRunner, SearchError, sortFunc } from 'mtgql'
import { cogDB as cogDBClient } from '../api/local/db'
import { CardImageView } from './cardBrowser/cardViews/cardImageView'
import { groupBy, sortBy } from 'lodash'
import './cubeView.css'
import { Input } from './component/input'
import { CUBE_SOURCE_TO_LABEL, cubeLink } from './component/cube/sourceIcon'
import { Modal } from './component/modal'
import { RefreshButton } from './component/cube/refreshButton'


interface OrderedCard extends Card {
  index: number
}
export function CubeView() {
  const { key } = useParams();
  const cube = useLiveQuery(() => cogDBClient.getCube(key), [key]);
  const needsMigration = cube && cube.print_ids === undefined;
  const [oracles, setOracles] = useState<{ [key: string]: NormedCard[] }>({})
  const [cards, setCards] = useState<OrderedCard[]>([])
  const [error, setError] = useState<SearchError | undefined>()
  const [filterQuery, setFilterQuery] = useState<string>("")
  const [filteredCards, setFilteredCards] = useState<OrderedCard[] | undefined>();
  const cardsToDisplay = filteredCards ?? cards;
  const sorted: OrderedCard[] = sortBy(cardsToDisplay, sortFunc("cube")) as OrderedCard[]
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
        const newOracles = (await cogDBClient.card.bulkGet(cube.oracle_ids)) ?? [];
        setOracles(groupBy(newOracles, "oracle_id"));
        if (needsMigration) {
          const print_ids = newOracles.map(it => it.printings[0].id);
          await cogDBClient.cube.put({
            ...cube,
            print_ids,
          });
        } else {
          const printToCard: { [key: string]: Card } = {};
          for (const normCard of newOracles) {
            for (const print of normCard.printings) {
              printToCard[print.id] = {...normCard, ...print};
            }
          }

          for (let i = 0; i < cube.print_ids.length; i++){
            const printId = cube.print_ids[i]
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
    if (activeCard && cube.print_ids[activeCard.index] !== activeCard.id) {
      const print_ids = [
        ...cube.print_ids.slice(0, activeCard.index),
        activeCard.id,
        ...cube.print_ids.slice(activeCard.index + 1)
      ];
      const newCube = {
        ...cube,
        print_ids,
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
          {<div>a {cube.print_ids?.length ?? cube.oracle_ids.length} card cube</div>}
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
      {sorted.length > 0 && error === undefined && <div className='result-container'>
        <div className="card-image-container">
          {sorted.map((card, index) =>
            <CardImageView
              key={card.id + index.toString()}
              className={"_8"}
              card={{ data: card, matchedQueries: [`newcube:${key}`], weight: 1 }}
              onClick={() => setActiveCard(card)}
              onAdd={() => {}}
              onIgnore={() => {}}
              showRender={false}
              revealDetails={false}
              visibleDetails={[]}
            />)}
        </div>
      </div>}
    </div>
    <Modal
      open={activeCard !== undefined}
      title={<h2>{activeCard?.name}</h2>}
      onClose={() => setActiveCard(undefined)}>
      {activeCard && <>
        <CardImageView
          onAdd={() => {}}
          onIgnore={() => {}}
          card={{ data: activeCard, matchedQueries: [`newcube:${key}`], weight: 1 }}
          showRender={false}
          revealDetails={false}
          visibleDetails={[]}
        />
        <select value={activeCard.id} onChange={onPrintSelect}>
          {oracles[activeCard.oracle_id][0]
            .printings.map(printing =>
              <option value={printing.id}>
                {printing.set} {printing.collector_number}
              </option>)}
        </select>
        <button onClick={saveActiveCard}>save</button>
      </>}
    </Modal>
  </>
}