import React from "react";
import { rankInfo } from "./infoLines";
import { useHighlightPrism } from "../../../api/local/syntaxHighlighting";
import { QuerySetButton } from "../querySetButton";
import { DEFAULT_MODE_REGEXP, DEFAULT_WEIGHT_REGEXP, INCLUDE_REGEXP } from '../../../api/mtgql-ep/parser'

export const VENN_REGEXP = /^@(v|venn)\((.+)\)\((.+)\)$/;

export const multiQueryInfo =
  (renderSubquery: (count: number) => string) =>
  (queries: string[]): string[] => {
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
const RENDER_QUERY_INFO = multiQueryInfo(rankInfo);

export interface MultiQueryInfoBarProps {
  queries: string[];
  copyText: (mindex: number, maxdex: number) => void;
  onSubmit?: (baseIndex: number, selectedIndex: number) => void;
  canSubmit?: boolean;
  showLineNumbers?: boolean;
  showSubmit?: boolean;
}
export const MultiQueryActionBar = ({
  queries,
  copyText,
  canSubmit,
  onSubmit,
  showLineNumbers,
  showSubmit,
}: MultiQueryInfoBarProps) => {
  useHighlightPrism([queries]);
  const lineInfo = RENDER_QUERY_INFO(queries);
  const numDigits = queries.length.toString().length;

  return (
    <pre tabIndex={-1} className="language-none labels">
      {lineInfo.map((line, index) => (
        <div
          key={index}
          className={line.toLowerCase()}
          onClick={() => {
            const query = queries[index];
            const mindex = queries
              .slice(0, index)
              .map((it) => it.length)
              // the 1 accounts for \n
              .reduce((prev, next) => prev + next + 1, 0);
            // the 1 accounts for \n
            const maxdex = mindex + query.length + 1;
            copyText(mindex, maxdex);
          }}
        >
          {showLineNumbers && <code className={`multi-code line-number ${line.toLowerCase()}`}>{`${(index+1).toString().padStart(numDigits)} `}</code>}
          <code className={`multi-code ${line.toLowerCase()}`}>{line}</code>
          {showSubmit && (line === "BASE" || line === "VENN") && (
            <button
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
            </button>
          )}
        </div>
      ))}
    </pre>
  );
};
