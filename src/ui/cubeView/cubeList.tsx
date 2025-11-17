import React, { useContext } from 'react'
import { LoaderText } from '../component/loaders'
import { CubeViewModelContext, OrderedCard } from './useCubeViewModel'
import { CardResultsLayout } from './cardResults'
import { FilterControl } from '../cardBrowser/filterControl'
import { CubeSort } from './cubeSort'
import { Setter } from '../../types'
import { SearchError } from 'mtgql'

export interface CubeListProps {
  cards: OrderedCard[]
  ordering: string[]
  setOrdering: Setter<string[]>
  filter: string;
  setFilter: Setter<string>
  filterError?: SearchError
}

export function CubeList({ cards, ordering, setFilter, filter, setOrdering, filterError }: CubeListProps) {
  const { cube, loadingError } = useContext(CubeViewModelContext);

  return (
      <CardResultsLayout
        cards={cards}
        sortControl={<CubeSort setOrdering={setOrdering} ordering={ordering} />}
        filterControl={
          <FilterControl
            filterQuery={filter}
            setFilterQuery={setFilter}
            highlightError={filterError ? 'Failed to parse filter' : ''}
          />
        }
        extraControls={
          <>
            {!filterError && filter && (
              <div>
                filter matched {cards.length} of {cube.cards.length}
              </div>
            )}
            {cards.length === 0 && !filterError && loadingError === undefined && (
              <LoaderText text='Loading cards' />
            )}
            {loadingError}
          </>
        }
      />
    )
}