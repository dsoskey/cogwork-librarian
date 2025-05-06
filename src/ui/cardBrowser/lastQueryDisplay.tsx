import React from "react";
import { MultiQueryActionBar, savedCardsQueryInfo } from '../component/editor/multiQueryActionBar'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { ArrowInIcon, ArrowOutIcon } from '../icons/arrows'
import { rankInfo } from '../component/editor/infoLines'

export interface LastQueryDisplayProps {
  lastQueries: string[]
  selectBox?: React.ReactNode;
  editorControls?: React.ReactNode;
}

export function LastQueryDisplay({ selectBox, lastQueries, editorControls }: LastQueryDisplayProps) {
  const [expanded, setExpanded] = useLocalStorage("last-query-expand", true);
  if (lastQueries.length === 0)
    return null;

  let toDisplay = lastQueries;
  if (!expanded) {
    if (lastQueries.length > 1) {
      toDisplay =  [`${lastQueries[0]} (and ${lastQueries.length - 1} subqueries...)`]
    } else {
      toDisplay = [lastQueries[0]];
    }
  }

  return <div className="query-editor">
    <MultiQueryActionBar
      queries={toDisplay}
      copyText={()=>{}}
      renderQuery={savedCardsQueryInfo(rankInfo)}
      gutterColumns={["multi-info"]}
    />
    <div className="editor-controls">
      {selectBox}
      <button
        disabled={lastQueries.length === 1}
        title={expanded ? "Hide subqueries" : "Show subqueries"}
        onClick={() => setExpanded(prev => !prev)}>
        {expanded ? <ArrowInIcon /> : <ArrowOutIcon />}
      </button>
      {editorControls}
    </div>
    <pre
      className="language-scryfall-extended-multi last-query display">
      <code>{toDisplay.join("\n")}</code>
    </pre>
  </div>;
}

