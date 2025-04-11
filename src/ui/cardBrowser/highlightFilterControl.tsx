import React from "react";
import { Input } from '../component/input'
import { Setter } from '../../types'
import { ErrorIcon } from '../icons/error'

export interface HighlightFilterControlProps {
  filterQuery: string
  setFilterQuery: Setter<string>
  highlightError: string
}

export function HighlightFilterControl({ filterQuery, setFilterQuery, highlightError }: HighlightFilterControlProps) {

  return <label className='highlight-filter-root row center'>
    <span className='bold'>Highlight:</span>
    <Input
      language="scryfall"
      value={filterQuery}
      onChange={e => setFilterQuery(e.target.value)}
      placeholder='cards matching this filter'
    />
    {highlightError.length > 0 && <ErrorIcon fill="var(--light-color)" />}
  </label>;
}

