import React from "react";
import { Input } from '../component/input'
import { Setter } from '../../types'
import { ErrorIcon } from '../icons/error'

export interface FilterControlProps {
  filterQuery: string
  setFilterQuery: Setter<string>
  highlightError: string
  label?: string
}

export function FilterControl({ label = 'filter:', filterQuery, setFilterQuery, highlightError }: FilterControlProps) {

  return <label className='filter-root row center'>
    <span className='bold'>{label}</span>
    <Input
      language="scryfall"
      value={filterQuery}
      onChange={e => setFilterQuery(e.target.value)}
      placeholder='cards matching this filter'
    />
    {highlightError.length > 0 && <ErrorIcon fill="var(--light-color)" />}
  </label>;
}

