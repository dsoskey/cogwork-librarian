import { useLocalStorage } from '../../api/local/useLocalStorage'
import { OrderedCard } from './useCubeViewModel'
import React, { useMemo } from 'react'
import _sortBy from 'lodash/sortBy'
import { Card, SortFunctions } from 'mtgql'
import { Multiselect } from '../component/multiselect'


function isCreature(card: OrderedCard): number {
  if (card.type_line?.includes("Creature")) return 0
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
  word_count: SortFunctions.byWordCount,
  full_word_count: SortFunctions.byFullWordCount,
}

export const SORT_OPTIONS = [
  // Defaults
  "color_id", 'cmc', "creatures_first", 'type_line', 'name',
  "usd", "eur", "tix",
  "color",
  "released",
  "rarity",
  "edhrec",
  "word_count",
  "full_word_count"
]
export const DEFAULT_ORDERING = ["color_id", 'cmc', "creatures_first", 'type_line', 'name']


export function useCubeSort(cards: OrderedCard[]) {
  const [ordering, setOrdering] = useLocalStorage<string[]>("cube-sort.coglib.sosk.watch", DEFAULT_ORDERING)
  const sorted: OrderedCard[] = useMemo(() => {
    return _sortBy(cards, ordering.map(it => orderValToKey[it] ?? it),
    ) as OrderedCard[]
  }, [cards, ordering])

  return {
    ordering, setOrdering, sorted,
  }
}

export function CubeSort({ ordering, setOrdering }) {
  return <Multiselect
    optionTransform={it => it.replace(/_/g, " ")}
  defaultValue={DEFAULT_ORDERING}
  labelComponent={<span className="bold">sort: </span>} value={ordering} setValue={setOrdering}>
  {SORT_OPTIONS.map(value => {
    return <option key={value} value={value}>
      {value.replace(/_/g, " ")}
    {ordering.find(it => it === value) && " \u2714"}
    </option>
  })}
  </Multiselect>
}