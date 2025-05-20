import React, { useMemo, useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB, QueryHistory } from '../api/local/db'
import { useHighlightPrism } from '../api/local/syntaxHighlighting'
import './historyView.css'
import { COPY_BUTTON_ICONS, CopyToClipboardButton } from './component/copyToClipboardButton'
import { PageControl, PageInfo, usePageControl } from './cardBrowser/pageControl'
import { LoaderText } from './component/loaders'
import { MultiQueryActionBar, multiQueryInfo, savedCardsQueryInfo } from './component/editor/multiQueryActionBar'
import { rankInfo } from './component/editor/infoLines'
import { ArrowInIcon, ArrowOutIcon } from './icons/arrows'
import _groupBy from 'lodash/groupBy'

const INDICATOR = '>>'

const displayQuery = (history: QueryHistory) => {
  const result = history.baseIndex > 0 ? [`# ${history.baseIndex} prev lines ...`] : [];
  let currentIndex = history.baseIndex;
  while (currentIndex < history.rawQueries.length && history.rawQueries[currentIndex].length > 0) {
    const prefix = history.baseIndex === currentIndex ? INDICATOR : ''.padStart(INDICATOR.length);
    result.push(`${prefix} ${history.rawQueries[currentIndex]}`);
    currentIndex++;
  }
  if (currentIndex < history.rawQueries.length) {
    result.push(`# ${history.rawQueries.length - currentIndex} more lines ...`)
  }
  return result;
}
const displayFullQuery = (history: QueryHistory) => history.rawQueries.map((line, index) => {
    const prefix = history.baseIndex === index ? INDICATOR : ''.padStart(INDICATOR.length);
    return `${prefix} ${line}`
  })

interface HistoryItemProps {
  history: QueryHistory
}
const HistoryItem = ({ history }: HistoryItemProps) => {
  const [expanded, setExpanded] = useState<boolean>(false)

  const toDisplay = expanded ? displayFullQuery(history) : displayQuery(history)
  useHighlightPrism([expanded])

  return <div>
    <div>{history.executedAt.toLocaleString()}</div>
    <div className='text-editor-root'>
      <MultiQueryActionBar
        queries={toDisplay}
        copyText={() => {
        }}
        renderQuery={multiQueryInfo(rankInfo)}
        gutterColumns={['line-numbers', 'multi-info']}
        indexStart={expanded ? 0 : Math.max(0, history.baseIndex - 1)}
      />
      <div className='editor-controls'>
        <button
          disabled={toDisplay.length === 1}
          title={expanded ? 'show query set' : 'show full text'}
          onClick={() => setExpanded(prev => !prev)}>
          {expanded ? <ArrowInIcon /> : <ArrowOutIcon />}
        </button>
        <CopyToClipboardButton copyText={history.rawQueries.join('\n')} buttonText={COPY_BUTTON_ICONS} />
      </div>
      <pre
        className='language-scryfall-extended-multi last-query display'>
        <code>{toDisplay.join('\n')}</code>
      </pre>
    </div>
  </div>
}


export const HistoryView = ({ path }: { path: string }) => {
  const history = useLiveQuery(async () =>
      await cogDB.history
      .where("projectPath")
      .startsWith(path)
      .reverse()
      .sortBy("executedAt")
    , [path]);
  const historyByYearMonth = useMemo(() => {
    if (history === undefined) return [];
    const grouped = _groupBy(history, (it=> `${it.executedAt.getFullYear()}.${(it.executedAt.getMonth() + 1).toString().padStart(2, '0')}`));
    return Object.entries(grouped);
  }, [history])
  const count = history?.length ?? 0;

  return <div className='history-view'>
    {history === undefined && <LoaderText text="loading history" />}
    {historyByYearMonth.map(([yearMonth, entries]) => <HistorySection key={yearMonth} yearMonth={yearMonth} entries={entries} />)}
    {history !== undefined && <>
      {count === 0 && <div>No searches recorded. Go make some history!</div>}
      {count > 0 && history.length === 0 && <div>no project found at {path}</div>}
    </>}
  </div>
}


interface HistorySectionProps {
  yearMonth: string;
  entries: QueryHistory[];
}

function HistorySection({ yearMonth, entries }: HistorySectionProps) {
  const [expanded, setExpanded] = React.useState(false);


  return <div className="history-section-root">
    <div className="row center">
      <button
        title={expanded ? "Hide query history" : "Show query history"}
        onClick={() => setExpanded(prev => !prev)}>
        {expanded ? <ArrowInIcon /> : <ArrowOutIcon />}
      </button>
      <div className="row baseline">
        <h3>{yearMonth} </h3>
        <em>({entries.length} {entries.length === 1 ? "query": "queries"})</em>
      </div>
    </div>
    {expanded && <div className="history-page">
      {entries.map(it => <HistoryItem key={it.id} history={it} />)}
    </div>}
  </div>
}