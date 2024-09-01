import React, { KeyboardEvent, useState } from 'react'
import { Input } from '../component/input'

interface CubeFilterProps {
  applyFilter: (query: string) => void;
  clearFilter: () => void;
  canClear: boolean
}

export function CubeFilter({ applyFilter, clearFilter, canClear }: CubeFilterProps) {
  const [filterQuery, setFilterQuery] = useState<string>('')

  const apply = () => applyFilter(filterQuery)

  const handleEnter = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') apply()
  }
  return <div className='cube-filter row center'>
    <label className='row center'>
      <span className='bold'>filter: </span>
      <Input language='scryfall-extended-multi' value={filterQuery} onChange={e => setFilterQuery(e.target.value)}
             onKeyDown={handleEnter} />
    </label>
    <button onClick={apply} disabled={filterQuery.length === 0}>Apply filter</button>
    <button onClick={clearFilter} disabled={!canClear}>Clear filter</button>
  </div>

}