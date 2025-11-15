import { downloadText } from '../download'
import { EnrichedCard } from '../../api/queryRunnerCommon'
import React, { useState } from 'react'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { useCopyToClipboard } from './copyToClipboardButton'
import { Card } from 'mtgql'

export interface ExportWidgetProps {
  searchResult: Array<EnrichedCard>
  lastQueries: string[]
  addCards: (query: string, card: Card[]) => void
}

type ExportAction = 'download' | 'copy' | 'save'
const ACTION_DEFAULT = {
  save: 1000,
}

export function ExportWidget({
  searchResult,
  lastQueries,
  addCards,
}: ExportWidgetProps) {
  const [action, setAction] = useLocalStorage<ExportAction>('export-action', 'save')

  const [value, setValue] = useState<number>(NaN)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Math.abs(parseInt(event.target.value)))
  }
  const handleKeydown = (event) => {
    if (
      event.key !== 'Tab' &&
      event.key !== 'Backspace' &&
      !/\d/.test(event.key)
    ) {
      event.preventDefault()
    }
  }

  const getNames = () =>
    searchResult.slice(0, sliceCount).map(printName).join('\n')
  const getJson = () =>
    JSON.stringify(searchResult.slice(0, sliceCount).map((it) => it.data))
  const namesCopy = useCopyToClipboard(getNames)
  const jsonCopy = useCopyToClipboard(getJson)
  const isCopyLoading = namesCopy.status === 'loading' || jsonCopy.status === 'loading'

  const sliceCount =
    value === 0 || isNaN(value) ? ACTION_DEFAULT[action] : value

  const handleExportCardNames = () => {
    switch (action) {
      case `download`:
        handleDownload(getNames(), 'txt')
        break
      case `copy`:
        namesCopy.onClick()
        break
      case 'save':
        addCards(
          lastQueries.join('\n'),
          searchResult.slice(0, sliceCount).map((it) => it.data)
        )
        break
    }
  }

  const handleExportJson = () => {
    switch (action) {
      case 'download':
        handleDownload(getJson(), 'json')
        break
      case `copy`:
        jsonCopy.onClick()
        break
      case 'save':
        break
    }
  }

  const onActionChange = (e) => setAction(e.target.value as ExportAction);

  return (
    <div className='download-button'>
      <span className='bold'>
        <select
          value={action}
          onChange={onActionChange}
        >
          <option value='download'>download</option>
          <option value='copy'>copy</option>
          <option value='save'>save</option>
        </select>
        <input
          type='number'
          pattern='[0-9]*'
          placeholder={
            action === 'save' && searchResult.length > ACTION_DEFAULT.save
              ? ACTION_DEFAULT.save.toString()
              : 'all'
          }
          value={isNaN(value) ? '' : value}
          onChange={handleChange}
          onKeyDown={handleKeydown}
        />
        :&nbsp;
      </span>

      <button disabled={isCopyLoading} onClick={handleExportCardNames}>
        card names
      </button>
      <button disabled={isCopyLoading || action === 'save'} onClick={handleExportJson}>
        json
      </button>
    </div>
  )
}

function handleDownload(text: string, fileExtension: string) {
  const now = new Date()
  const fileName = `coglib-results-${now.toISOString().replace(/:/g, '-')}`
  downloadText(text, fileName, fileExtension)
}

function printName(card: EnrichedCard) {
  if (card.data.layout === 'split') return card.data.name
  return card.data.name.replace(/\/\/.*$/, '')
}