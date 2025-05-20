import React, { useCallback } from 'react'
import { rankInfo } from "./infoLines";
import { QuerySetButton } from "../querySetButton";
import { DEFAULT_MODE_REGEXP, DEFAULT_WEIGHT_REGEXP, INCLUDE_REGEXP } from '../../../api/mtgql-ep/parser'

export type GutterColumn = "line-numbers" | "multi-info" | "submit-button"


export const VENN_REGEXP = /^@(v|venn)\((.+)\)\((.+)\)$/;

export function multiQueryInfo(renderSubquery: (count: number) => string = rankInfo) {
  return (queries: string[]): string[] => {
    if (queries.length === 0) {
      return [];
    }
    const result = [];
    let count = 0;
    let isMultiline = false;
    for (const line of queries) {
      const trimmed = line.trim();
      if (trimmed.length === 0) {
        result.push("    ");
        count = 0;
      } else if (trimmed.startsWith("#")) {
        result.push(" ");
      } else if (count === 0 && INCLUDE_REGEXP.test(trimmed)) {
        result.push("MPRT");
      } else if (count === 0 && DEFAULT_WEIGHT_REGEXP.test(trimmed)) {
        result.push("WGHT");
      } else if (count === 0 && DEFAULT_MODE_REGEXP.test(trimmed)) {
        result.push("MODE");
      } else if (count === 0) {
        result.push(VENN_REGEXP.test(line.trim()) ? "VENN" : "BASE");
        count += 1;
      } else if (isMultiline) {
        result.push(" ");
      } else {
        result.push(renderSubquery(count));
        count += 1;
      }
      isMultiline = !trimmed.startsWith("#") && trimmed.endsWith("\\");
    }
    return result;
  };
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
  renderQuery?: (queries: string[]) => string[]
  copyText: (mindex: number, maxdex: number) => void;
  onSubmit?: (baseIndex: number, selectedIndex: number) => void;
  canSubmit?: boolean;
  gutterColumns: GutterColumn[];
  indexStart?: number;
}
export const MultiQueryActionBar = React.memo(({
  queries,
  copyText,
  renderQuery = multiQueryInfo(rankInfo),
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
          onClickLine={onClickLine(index)}
          {...rest}
        />)
      )}
    </pre>
  );
});

interface ActionLineProps {
  line: string;
  index: number;
  indexStart: number;
  onClickLine?: () => void;
  gutterColumns: GutterColumn[];
  numDigits: number;
  onSubmit?: (baseIndex: number, selectedIndex: number) => void;
  canSubmit?: boolean;
}

function ActionLine({ line, index, indexStart, gutterColumns, onClickLine, numDigits, onSubmit, canSubmit }: ActionLineProps) {
  const columns: React.ReactNode[] = [];
  for (const column of gutterColumns) {
    switch (column) {
      case "line-numbers":
        columns.push(<code
          className={`multi-code line-number ${line.toLowerCase()}`}>
          {`${(index + 1 + indexStart).toString().padStart(numDigits)} `}
        </code>);
        break;
      case 'multi-info':
        columns.push(<code
          className={`multi-code ${line.toLowerCase()}`}>
          {line}
        </code>)
        break;
      case 'submit-button':
        if (line === "BASE" || line === "VENN") {
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
    key={index}
    className={line.toLowerCase()}
    onClick={onClickLine}
  >
    {...columns}
  </div>
}