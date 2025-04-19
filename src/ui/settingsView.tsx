import React from 'react'
import { ThemePicker } from './component/theme'
import { FormField } from './component/formField'
import { PREFER_VALUES, SearchOptions, SortOrder } from 'mtgql'
import { useLocalStorage } from '../api/local/useLocalStorage'
import { SORT_ORDERS } from 'mtgql/build/filters/order'
import { Setter } from '../types'

const SORT_VALUES = Object.values(SORT_ORDERS)
import './settingsView.css'

export function SettingsView() {
  const [options, setters] = useSearchOptions()
  return <>
    <h2>Search defaults</h2>
    <SearchOptionPicker options={options} {...setters} />
    <h2>Theme</h2>
    <ThemePicker />
  </>
}

export interface SearchDefaultPickerProps extends SearchSetters {
  options: SearchOptions;
}

export function SearchOptionPicker({
  options,
  setDefaultOrder,
  setDefaultUnique,
  setDefaultPrefer,
  setDefaultDirection
}: SearchDefaultPickerProps) {
  return <div className='search-option-root column'>
    <FormField title='Unique:' inline>
      <select
        onChange={e => setDefaultUnique(e.currentTarget.value)}
        value={options.unique}
      >
        {['cards', 'art', 'prints'].map(value => <option
          key={value}
          value={value}>
          {value}
        </option>)}
      </select>
    </FormField>
    <FormField title='Prefer:' inline>
      <select
        onChange={e => setDefaultPrefer(e.currentTarget.value)}
        value={options.prefer}
      >
        {PREFER_VALUES.map(value => <option
          key={value}
          value={value}>
          {value}
        </option>)}
      </select>
    </FormField>
    <FormField title='Order:' inline>
      <select
        onChange={e => setDefaultOrder(e.currentTarget.value)}
        value={options.order}
      >
        {SORT_VALUES.map(value => <option
          key={value}
          value={value}>
          {value}
        </option>)}
      </select>
    </FormField>
    <FormField title='Direction:' inline>
      <select
        onChange={e => setDefaultDirection(e.currentTarget.value)}
        value={options.dir}
      >
        {['auto', 'asc', 'des'].map(value => <option
          key={value}
          value={value}>
          {value}
        </option>)}
      </select>
    </FormField>
  </div>
}

interface SearchSetters {
  setDefaultUnique: Setter<string>
  setDefaultPrefer: Setter<string>
  setDefaultOrder: Setter<string>
  setDefaultDirection: Setter<string>
}

export function useSearchOptions(): [SearchOptions, SearchSetters] {
  const [defaultPrefer, setDefaultPrefer] = useLocalStorage<string>('default-prefer', 'oldest')
  const [defaultOrder, setDefaultOrder] = useLocalStorage<SortOrder>('default-order', 'cmc')
  const [defaultUnique, setDefaultUnique] = useLocalStorage<string>('default-unique', 'cards')
  const [defaultDirection, setDefaultDirection] = useLocalStorage<'auto' | 'asc' | 'desc'>('default-direction', 'auto')

  return [{
    prefer: defaultPrefer,
    order: defaultOrder,
    dir: defaultDirection,
    unique: defaultUnique
  }, {
    setDefaultPrefer,
    setDefaultOrder,
    setDefaultUnique,
    setDefaultDirection
  }]
}