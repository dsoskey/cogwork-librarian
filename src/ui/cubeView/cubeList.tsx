import React, { KeyboardEvent, useContext, useMemo, useState } from 'react'
import { Setter } from '../../types'
import { Input } from '../component/input'
import { Multiselect } from '../component/multiselect'
import { CardsPerRowControl } from '../component/cardsPerRowControl'
import { LoaderText } from '../component/loaders'
import { CardImageView } from '../cardBrowser/cardViews/cardImageView'
import { useViewportListener } from '../viewport'
import { CubeViewModelContext, OrderedCard } from './useCubeViewModel'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { useMemoryQueryRunner } from '../../api/local/useQueryRunner'
import { parseQuerySet } from '../../api/mtgql-ep/parser'
import { RunStrategy } from '../../api/queryRunnerCommon'
import { cogDB as cogDBClient } from '../../api/local/db'
import _sortBy from 'lodash/sortBy'
import { Card, SearchOptions, SortFunctions } from 'mtgql'

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

const options: SearchOptions = {
    order: 'cmc',
    dir: 'auto',
}
export interface CubeListProps {

}

export function CubeList({}: CubeListProps) {
    const viewport = useViewportListener();
    const { cube, cards, oracleList, loadingError, setActiveCard } = useContext(CubeViewModelContext);
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
        console.time("cardmap")
        const _cards = queryRunner.status === "success"
          // grossly inefficient
          ? queryRunner.result.map(it => it.data)
          : cards;
        console.timeEnd("cardmap")
        return _sortBy(_cards, ordering.map(it => orderValToKey[it] ?? it),
        ) as OrderedCard[]
    }, [queryRunner.result, cards, ordering])

    return <>
        <div className="header">
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
    </>;
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