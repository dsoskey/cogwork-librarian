import React, { KeyboardEvent, useContext, useMemo, useState } from 'react'
import _sortBy from 'lodash/sortBy'
import { Card, SearchOptions, SortFunctions } from 'mtgql'
import { cogDB as cogDBClient } from '../../api/local/db'
import { CardImageView } from '../cardBrowser/cardViews/cardImageView'
import './cubeView.css'
import { Input } from '../component/input'
import { CUBE_SOURCE_TO_LABEL, cubeLink } from '../component/cube/sourceIcon'
import { Modal } from '../component/modal'
import { RefreshButton } from '../component/cube/refreshButton'
import { ScryfallIcon } from '../component/scryfallIcon'
import { LoaderText } from '../component/loaders'
import { Multiselect } from '../component/multiselect'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { CopyToClipboardButton } from '../component/copyToClipboardButton'
import { CardsPerRowControl } from '../component/cardsPerRowControl'
import { useViewportListener } from '../viewport'
import { useMemoryQueryRunner } from '../../api/local/useQueryRunner'
import { parseQuerySet } from '../../api/mtgql-ep/parser'
import { RunStrategy } from '../../api/queryRunnerCommon'
import { Setter } from '../../types'
import { CubeNotFoundView } from './notFoundView'
import {
  CubeViewModelContext,
  OrderedCard,
  useCubeViewModel
} from './useCubeViewModel'

const shareButtonText = {
  unstarted: '🔗',
  success: '✅',
  error: '🚫',
}

function isCreature(card: OrderedCard): number {
  if (card.type_line.includes("Creature")) return 0
  return 1
}
function byEdhrecRank(card: Card) {
  return card.edhrec_rank ?? Number.MAX_VALUE
}

const orderValToKey = {
  color_id: SortFunctions.byColorId,
  usd: SortFunctions.byUsd,
  color: SortFunctions.byColor,
  released: SortFunctions.byReleased,
  rarity: SortFunctions.byRarity,
  edhrec: byEdhrecRank,
  creatures_first: isCreature,
}

const SORT_OPTIONS = [
  // Defaults
  "color_id", 'cmc', "creatures_first", 'type_line', 'name',
  "usd", "eur", "tix",
  "color",
  "released",
  "rarity",
  "edhrec",
]

export function CubeView() {
  const cubeViewModel = useCubeViewModel();
  const { cube, oracleMap } = cubeViewModel;
  const [activeCard, setActiveCard] = useState<OrderedCard | undefined>();

  const onPrintSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const normedCard = oracleMap[activeCard.oracle_id][0]
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

  return <CubeViewModelContext.Provider value={cubeViewModel}>
    <div className='cube-view-root'>
      {cube === null && <div className='header'><h2><LoaderText /></h2></div>}
      {cube === undefined && <CubeNotFoundView />}
      {cube && <CubeModelView setActiveCard={setActiveCard} />}
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
          <CardImageView card={{ data: activeCard, matchedQueries: [`cube:${cube.key}`], weight: 1 }} />
          <div>
            <select value={activeCard.id} onChange={onPrintSelect}>
              {oracleMap[activeCard.oracle_id][0]
                .printings.map(printing =>
                  <option key={printing.id} value={printing.id}>
                    {printing.set_name} – ({printing.set} {printing.collector_number})
                  </option>)}
            </select>
            <button onClick={saveActiveCard}>save</button>
        </div>
      </>}
    </Modal>
  </CubeViewModelContext.Provider>
}


const options: SearchOptions = {
  order: 'cmc',
  dir: 'auto',
}

interface CubeModelViewProps {
  setActiveCard: Setter<OrderedCard | undefined>
}
function CubeModelView({ setActiveCard }: CubeModelViewProps) {
  const viewport = useViewportListener();
  const { cube, cards, oracleList, loadingError } = useContext(CubeViewModelContext);
  const [cardsPerRow, setCardsPerRow] = useLocalStorage('cards-per-row', 4)
  const queryRunner = useMemoryQueryRunner({ corpus: oracleList });

  const execute = (queries: string[], baseIndex: number) => {
    parseQuerySet(queries, baseIndex)
      .map(({ strategy, queries, getWeight, injectPrefix }) => {
        const executedAt = new Date();
        let promise
        if (strategy === RunStrategy.Venn && queryRunner.generateVenn !== undefined) {
          const [left, right, ...rest] = queries
          promise = queryRunner.generateVenn(left, right, rest, options, getWeight)
        } else {
          promise = queryRunner.run(queries, options, injectPrefix, getWeight)
        }
        promise.then(() =>
          cogDBClient.history.put({
            rawQueries: queries,
            baseIndex,
            source: 'local',
            strategy,
            executedAt,
            projectPath: `/.coglib/cube/${cube.key}`,
          })
        ).catch(error => {
          console.error(error)
          cogDBClient.history.put({
            rawQueries: queries,
            baseIndex,
            source: 'local',
            strategy,
            errorText: error.toString(),
            executedAt,
            projectPath: `/.coglib/cube/${cube.key}`,
          })
        })
      })
  }
  const applySimpleFilter = (query: string) => {
    execute([query], 0);
  }

  const [ordering, setOrdering] = useLocalStorage<any[]>(
    "cube-sort.coglib.sosk.watch",
    ["color_id", 'cmc', "creatures_first", 'type_line', 'name']
  )
  const sorted: OrderedCard[] = useMemo(() => {
    const _cards = queryRunner.status === "success"
      // grossly inefficient
      ? queryRunner.result.map(it => it.data)
      : cards;
    return _sortBy(_cards, ordering.map(it => orderValToKey[it] ?? it),
    ) as OrderedCard[]
  }, [queryRunner.result, cards, ordering])

  return <>
    <div className='header'>
      <h2>{cube.key}</h2>
      {/*{runner.status === "error" && <div className="alert">{searchError.message}</div>}*/}
      {<div>
        a {cube.cards?.length ?? cube.print_ids?.length ?? cube.oracle_ids.length} card cube
        from{" "}
        {cube.source !== "list" && <>
          <a href={cubeLink(cube)}
             rel='noreferrer'
             target='_blank'>
            {CUBE_SOURCE_TO_LABEL[cube.source]}
          </a>
          {" "}
          <RefreshButton toSubmit={[cube]} />
          <CopyToClipboardButton
            copyText={`${window.location.protocol}//${window.location.host}/data/cube/${cube.key}?source=${cube.source}`}
            title={`copy share link to keyboard`}
            buttonText={shareButtonText}
          />
        </>}
        {cube.source === "list" && "a text list"}
        {" "}
        <strong>last updated:</strong> {cube.last_updated?.toLocaleString() ?? "~"}
      </div>}
      <SimpleFilterAndSort
        ordering={ordering} setOrdering={setOrdering}
        applyFilter={applySimpleFilter}
        clearFilter={queryRunner.reset}
        canClear={queryRunner.status !== "unstarted"}
      />
      {viewport.width > 1024 && <CardsPerRowControl setCardsPerRow={setCardsPerRow} cardsPerRow={cardsPerRow} />}
      {queryRunner.status === "success" && <div>filter matched {queryRunner.result.length} of {cube.print_ids.length}</div>}
      {cards.length === 0
        && queryRunner.status !== "error"
        && loadingError === undefined
        && <LoaderText text="Loading cards"/>}
      {loadingError}
    </div>
    {sorted.length > 0 && queryRunner.status !== 'error' && <div className='result-container'>
      {sorted.map((card, index) =>
        <CardImageView
          key={card.id + index.toString()}
          className={`_${cardsPerRow}`}
          card={{ data: card, matchedQueries: [`cube:${cube.key}`], weight: 1 }}
          onClick={() => setActiveCard(card)}
        />)}
    </div>}
  </>
}

interface SimpleFilterAndSortProps {
  ordering: any[]
  setOrdering: Setter<any[]>
  applyFilter: (query: string) => void;
  clearFilter: () => void;
  canClear: boolean
}
function SimpleFilterAndSort({ ordering, setOrdering, applyFilter, clearFilter, canClear }: SimpleFilterAndSortProps) {
  const [filterQuery, setFilterQuery] = useState<string>("")

  const apply = () => applyFilter(filterQuery)

  const handleEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") apply();
  }
  return <>
    <div className="cube-filter row center">
      <label className='row center'>
        <strong>filter: </strong>
        <Input language="scryfall" value={filterQuery} onChange={e => setFilterQuery(e.target.value)} onKeyDown={handleEnter} />
      </label>
      <button onClick={apply} disabled={filterQuery.length === 0}>Apply filter</button>
      <button onClick={clearFilter} disabled={!canClear}>Clear filter</button>
    </div>
    <Multiselect
      optionTransform={it => it.replace(/_/g, " ")}
      labelComponent={<strong>sort: </strong>} value={ordering} setValue={setOrdering}>
      {SORT_OPTIONS.map(value => {
        return <option key={value} value={value}>
          {value.replace(/_/g, " ")}
          {ordering.find(it => it === value) && " \u2714"}
        </option>
      })}
    </Multiselect>
  </>
}