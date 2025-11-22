import React, { useCallback } from 'react'
import { BOX_CHARS, rankInfo } from './infoLines'
import { QuerySetButton } from "../querySetButton";
import { DEFAULT_MODE_REGEXP, DEFAULT_WEIGHT_REGEXP, INCLUDE_REGEXP } from '../../../api/mtgql-ep/parser'

// todo: add setting for which lineInfo you want
export type GutterColumn = "line-numbers" | "multi-info" | "multi-hook" | "submit-button"


export const VENN_REGEXP = /^@(v|venn)\((.+)\)\((.+)\)$/;

export function multiQueryInfo(renderSubquery: (count: number) => string = rankInfo) {
  return (queries: string[]): LineInfo[] => {
    if (queries.length === 0) {
      return [];
    }
    const result: LineInfo[] = [];
    let count = 0;
    let isMultiline = false;
    for (const line of queries) {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        result.push({ type: 'space', text: '    ' });
        count = 0;
      } else if (trimmed.startsWith("#")) {
        result.push({ type: "comment", text: ' ' });
      } else if (count === 0 && INCLUDE_REGEXP.test(trimmed)) {
        result.push({ type: "import", text: 'MPRT' });
      } else if (count === 0 && DEFAULT_WEIGHT_REGEXP.test(trimmed)) {
        result.push({ type: "weight", text: 'WGHT' });
      } else if (count === 0 && DEFAULT_MODE_REGEXP.test(trimmed)) {
        result.push({ type: "mode", text: 'MODE' });
      } else if (count === 0) {
        result.push({ type: 'query-header', text: VENN_REGEXP.test(trimmed) ? 'VENN' : 'BASE' });
        count += 1;
      } else if (isMultiline) {
        result.push({ type: 'space', text: ' ' });
      } else {
        result.push({ type: "space", text: renderSubquery(count) });
        count += 1;
      }
      isMultiline = !trimmed.startsWith("#") && trimmed.endsWith("\\");
    }
    return result;
  };
}

type LineType = "space" | "comment" | "query-header" | "subquery-middle" | "subquery-end" | "import" | "weight" | "mode"
interface LineInfo {
  text: string
  type: LineType
}

export function goodLineQuery(queries: string[]): LineInfo[] {
    if (queries.length === 0) return [];
    if (typeof queries[0] === 'object') return [];

    const result: LineInfo[] = [];

    let querySetCount = 0;
    let subqueryCount = 0;
    let isMultiline = false;
    let isInQuery = false;

    for (let i = 0; i < queries.length; i++) {
      const line = queries[i].trim();
      const isEndOfQuerySet = i === queries.length - 1 || queries[i+1].trim().length === 0;

      if (line.length === 0) {
        result.push({ type: "space",  text: '    ' });
        subqueryCount = 0;
        isInQuery = false;
      } else if (line.startsWith("#")) {
        result.push({ type: isInQuery ? "subquery-middle" : "comment", text: " " });
      } else if (subqueryCount === 0 && INCLUDE_REGEXP.test(line)) {
        result.push({ type: "import", text: 'MPRT' });
      } else if (subqueryCount === 0 && DEFAULT_WEIGHT_REGEXP.test(line)) {
        result.push({ type: "weight", text: 'WGHT' });
      } else if (subqueryCount === 0 && DEFAULT_MODE_REGEXP.test(line)) {
        result.push({ type: "mode", text: 'MODE' });
      } else if (subqueryCount === 0) {
        const renderedQueryType = VENN_REGEXP.test(line) ? "V" : "B";
        querySetCount += 1;
        const cap = isEndOfQuerySet ?
          BOX_CHARS.horizontal :
          BOX_CHARS.fuckedUpT
        const renderedQuerySetCount = querySetCount.toString().padEnd(2, BOX_CHARS.horizontal) + cap;
        result.push({ type: "query-header", text: renderedQueryType + renderedQuerySetCount });
        subqueryCount += 1;
        isInQuery = true;
      } else if (isMultiline) {
        result.push({ type: "subquery-middle", text: BOX_CHARS.vertical });
      } else {
        result.push({
          type: isEndOfQuerySet ? "subquery-end" : "subquery-middle",
          text: subqueryCount.toString().padStart(4)
        });
        subqueryCount += 1;
      }
      isMultiline = !line.startsWith("#") && line.endsWith("\\");

    }
    return result;
}

export function savedCardsQueryInfo(renderSubquery: (count: number) => string = rankInfo) {
  return (queries: string[]): string[] => {
    if (queries.length === 0) {
      return [];
    }

    if (queries.length === 1) {
      return [""];
    }

    return queries.map((line, i) => {
      if (i === 0) {
        return VENN_REGEXP.test(line.trim()) ? "VENN" : "BASE";
      } else {
        return renderSubquery(i);
      }
    });
  }
}

export interface MultiQueryInfoBarProps {
  queries: string[];
  renderQuery?: (queries: string[]) => LineInfo[]
  copyText: (mindex: number, maxdex: number) => void;
  onSubmit?: (baseIndex: number, selectedIndex: number) => void;
  canSubmit?: boolean;
  gutterColumns: GutterColumn[];
  highlightedRow?: number;
  setHighlightedRow?: (e: React.MouseEvent, newNumber: number) => void;
  indexStart?: number;
}
export const MultiQueryActionBar = React.memo(({
  queries,
  copyText,
  highlightedRow, setHighlightedRow,
  renderQuery = goodLineQuery,
  indexStart = 0,
  ...rest
}: MultiQueryInfoBarProps) => {
  const lineInfo = renderQuery(queries);
  const numDigits = queries.length.toString().length;

  const onClickLine = useCallback((index: number) => () => {
    const query = queries[index];
    const mindex = queries
      .slice(0, index)
      .map((it) => it.length)
      // the 1 accounts for \n
      .reduce((prev, next) => prev + next + 1, 0);
    // the 1 accounts for \n
    const maxdex = mindex + query.length + 1;
    copyText(mindex, maxdex);
  }, [queries, copyText]);

  return (
    <pre tabIndex={-1} className="labels">
      {lineInfo.map((line, index) => (
        <ActionLine
          key={index}
          line={line}
          index={index}
          indexStart={indexStart}
          numDigits={numDigits}
          highlighted={index === highlightedRow}
          onHover={setHighlightedRow ? (e) => {
            setHighlightedRow(e, index)
          } : undefined}
          onClickLine={onClickLine(index)}
          {...rest}
        />)
      )}
    </pre>
  );
});

interface ActionLineProps {
  line: LineInfo;
  index: number;
  indexStart: number;
  onClickLine?: () => void;
  gutterColumns: GutterColumn[];
  numDigits: number;
  highlighted?: boolean;
  onHover?: (e: React.MouseEvent) => void;
  onSubmit?: (baseIndex: number, selectedIndex: number) => void;
  canSubmit?: boolean;
}

function ActionLine({ highlighted, onHover, line, index, indexStart, gutterColumns, onClickLine, numDigits, onSubmit, canSubmit }: ActionLineProps) {
  const { text, type } = line;
  const columns: React.ReactNode[] = [];
  for (const column of gutterColumns) {
    switch (column) {
      case "line-numbers":
        columns.push(<code
          className={`line-number ${highlighted ? "highlight" : ""} ${type}`}>
          {`${(index + 1 + indexStart).toString().padStart(numDigits)} `}
        </code>);
        break;
      case 'multi-info':
      case 'multi-hook':
        columns.push(<code
          className={`multi-code ${type}`}>
          {text}
        </code>)
        break;
      case 'submit-button':
        if (type === 'query-header') {
          columns.push(<button
              onClick={(event) => {
                if (canSubmit && onSubmit) {
                  event.stopPropagation();
                  onSubmit(index, index);
                }
              }}
              disabled={!canSubmit}
              title="run query"
              className="run-query-button"
            >
              <QuerySetButton />
            </button>);
        }
        break;

    }
  }
  return <div
    onMouseMove={onHover}
    key={index}
    className={type.toLowerCase()}
    onClick={onClickLine}
  >
    {...columns}
  </div>
}