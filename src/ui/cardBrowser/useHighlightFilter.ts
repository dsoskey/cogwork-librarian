import { Card, QueryRunner } from 'mtgql'
import { useEffect, useState } from 'react'
import { COGDB_FILTER_PROVIDER } from '../../api/local/db'


export function useHighlightFilter(query: string, submittedQueries: string[] = []) {
  const [highlightFilter, setHighlightFilter] = useState<(card: Card) => boolean>(
    () => () => false
  )
  const [error, setError] = useState<string>("")

  useEffect(() => {
    setError("");
    if (query.length === 0) {
      setHighlightFilter(() => () => false);
      return;
    }

    let queryToRun = query;
    if (/^@\d+$/.test(query)) {
      const index = parseInt(query.replace("@", ""))
      if (index >= 0 && index < submittedQueries.length) {
        queryToRun = submittedQueries[index];
      }
    }
    // probably needs a debounce
    (async () => {
      try {
        const nextHighlightFilter = await QueryRunner
          .singleCardFilter(queryToRun, COGDB_FILTER_PROVIDER)
        // must use function syntax otherwise setter tries to evaluate function
        setHighlightFilter((_) => nextHighlightFilter)
      } catch (e) {
        console.error(error);
        setError(JSON.stringify(e));
        setHighlightFilter((_) => () => false);
      }
    })()
  }, [query, submittedQueries])

  return {
    highlightFilter,
    error,
  };
}