import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB, QueryHistory } from '../api/local/db'
import { useHighlightPrism } from '../api/local/syntaxHighlighting'
import "./historyView.css"
import { CopyToClipboardButton } from './component/copyToClipboardButton'
import { PageControl } from './cardBrowser/pageControl'
import { LoaderText } from './component/loaders'

const displayQuery = (history: QueryHistory) => {
  const result = history.baseIndex > 0 ? [`# ${history.baseIndex} prev lines...`] : [];
  let currentIndex = history.baseIndex;
  while (currentIndex < history.rawQueries.length && history.rawQueries[currentIndex].length > 0) {
    const prefix = history.baseIndex === currentIndex ? '*' : ' ';
    result.push(`${prefix} ${history.rawQueries[currentIndex]}`);
    currentIndex++;
  }
  if (currentIndex < history.rawQueries.length) {
    result.push(`# ${history.rawQueries.length - currentIndex} more lines ...`)
  }
  return result;
}
const displayFullQuery = (history: QueryHistory) => history.rawQueries.map((line, index) => {
    const prefix = history.baseIndex === index ? '*' : ' '
    return `${prefix} ${line}`
  }).join('\n');

interface HistoryItemProps {
  history: QueryHistory
}
const HistoryItem = ({ history }: HistoryItemProps) => {
  const [expanded, setExpanded] = useState<boolean>(false)

  const truncatedQuery = displayQuery(history);
  useHighlightPrism([expanded]);

  return <div className='column history-item'>
    <div className='query-label row'>
      <span>{history.executedAt.toLocaleString()} - {history.source} query</span>
      <button onClick={() => setExpanded(prev => !prev)}>
        {expanded ? 'show query set' : 'show full text'}
      </button>
      <CopyToClipboardButton copyText={history.rawQueries.join("\n")} >copy full text</CopyToClipboardButton>
    </div>
    <pre className='history language-scryfall-extended-multi'>
      <code>{expanded ? displayFullQuery(history) : truncatedQuery.join("\n")}</code>
    </pre>
  </div>
}

export const HistoryView = () => {
  const [page, setPage] = useState(0)
  const limit = 20;
  const upperBound = (page + 1) * limit
  const history = useLiveQuery(() => cogDB.history
    .orderBy("executedAt")
    .reverse()
    .offset(page * limit)
    .limit(limit)
    .toArray()
    , [page]);
  const count = useLiveQuery(() => cogDB.history.count())

  return <div className='history-view'>
    {history === undefined && <LoaderText text="loading history" />}
    {history !== undefined && <>
      <div className='row baseline route-header'>
        <h2>query history</h2>
        {count > 0 && <span>({upperBound - limit + 1}-{upperBound} of {count})</span>}
        {count > limit && <>
          <PageControl pageNumber={page} setPageNumber={setPage} upperBound={upperBound} pageSize={limit} count={count} /></>}
      </div>
      {history.map(it => <HistoryItem key={it.executedAt.toISOString()} history={it} />)}
      {count > limit && <PageControl pageNumber={page} setPageNumber={setPage} upperBound={upperBound} pageSize={limit} count={count} />}
    </>}
  </div>
}