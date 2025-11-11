import React, { useContext } from 'react'
import { ThemePicker } from './component/theme'
import { FormField, RangeField } from './component/formField'
import { PREFER_VALUES, SearchOptions, SortOrder } from 'mtgql'
import { useLocalStorage } from '../api/local/useLocalStorage'
import { SORT_ORDERS } from 'mtgql/build/filters/order'
import { Setter } from '../types'

const SORT_VALUES = Object.values(SORT_ORDERS)
import './settingsView.css'
import { SettingsContext } from './settingsContext'

export function SettingsView() {
  const [options, setters] = useSearchOptions()
  return <>
    <h2>Settings</h2>
    <h3>Data sync</h3>
    <AutoSyncSettings />
    <h3>Search defaults</h3>
    <SearchOptionPicker options={options} {...setters} />
    <h3>Editor</h3>
    <EditorSettings />
    <h3>Theme</h3>
    <ThemePicker />
  </>
}

type RefreshUnits = 'seconds'| 'minutes' | 'hours' | 'days'

export function AutoSyncSettings() {
  const [shouldSearchMissing, setShouldSearchMissing] = useLocalStorage('auto-find-cube',true);
  const [shouldSearchOld, setShouldSearchOld] = useLocalStorage('auto-refresh-cube',false);
  const [refreshRate, setRefreshRate] = useLocalStorage('refresh-rate',0);
  const [refreshUnits, setRefreshUnits] = useLocalStorage<RefreshUnits>('refresh-units','minutes');

  const handleRefreshRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const eventValue =parseInt(e.target.value)
    if (isNaN(eventValue)) return;
    if (eventValue < 0) return;
    setRefreshRate(parseInt(e.target.value))
  }

  return <div className="prose">
    <label className='row center pointer'>
      <input
        className='custom'
        type='checkbox'
        checked={shouldSearchMissing}
        onChange={e => setShouldSearchMissing(e.target.checked)}
      />
      <span className='bold'>Auto-search missing cubes</span>
    </label>
    <div className='indent-01'>
      <div><em>While running search queries, Cogwork Librarian will search CubeCobra for cubes not found in the local database.</em></div>
      <label className={`row center ${shouldSearchMissing ? 'pointer' : ''}`}>
        <input
          className='custom'
          type='checkbox'
          disabled={!shouldSearchMissing}
          checked={shouldSearchOld}
          onChange={e => setShouldSearchOld(e.target.checked)} />
        <span className='bold'>Also refresh existing cubes after </span>
        <input
          className='refresh-rate'
          type='number'
          value={refreshRate}
          disabled={!shouldSearchOld || !shouldSearchMissing}
          onChange={handleRefreshRateChange} />
        <select
          value={refreshUnits}
          onChange={e => setRefreshUnits(e.target.value as RefreshUnits)}
          disabled={!shouldSearchOld || !shouldSearchMissing}
        >
          <option value='minutes'>{refreshRate === 1 ? 'minute' : 'minutes'}</option>
          <option value='hours'>{refreshRate === 1 ? 'hour' : 'hours'}</option>
          <option value='days'>{refreshRate === 1 ? 'day' : 'days'}</option>
        </select>
      </label>
    </div>
  </div>
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

export function EditorSettings() {
  const { lineHeight, setLineHeight } = useContext(SettingsContext)


  const handleLineHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLineHeight(parseInt(e.target.value));
  }

    return <div>
      <RangeField title="Line height">
        <input
          type="range"
          min={100} max={200}
          step={25}
          value={lineHeight * 100}
          onChange={handleLineHeightChange}
        />
      </RangeField>
    </div>;
}