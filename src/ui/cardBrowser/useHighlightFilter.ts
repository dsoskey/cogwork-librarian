import { Card, QueryRunner, SearchError } from 'mtgql'
import { useEffect, useRef, useState } from 'react'
import { COGDB_FILTER_PROVIDER } from '../../api/local/db'


export function useHighlightFilter(query: string, submittedQueries?: string[], defaultFilterState = false) {
  const [highlightFilter, setHighlightFilter] = useState<(card: Card) => boolean>(
    () => () => defaultFilterState
  )
  const timeout = useRef();
  const [error, setError] = useState<SearchError | undefined>()

  useEffect(() => {
    setError(undefined);
    if (query.length === 0) {
      setHighlightFilter(() => () => defaultFilterState)
      return;
    }

    let queryToRun = query;
    if (submittedQueries && /^@\d+$/.test(query)) {
      const index = parseInt(query.replace("@", ""))
      if (index >= 0 && index < submittedQueries.length) {
        queryToRun = submittedQueries[index];
      }
    }
    timeout.current = setTimeout(async () => {
      try {
        timeout.current = undefined;
        const nextHighlightFilter = await QueryRunner.singleCardFilter(
          queryToRun,
          COGDB_FILTER_PROVIDER
        )
        // must use function syntax otherwise setter tries to evaluate function
        setHighlightFilter((_) => nextHighlightFilter)
      } catch (e) {
        console.error(e as SearchError)
        setError(e as SearchError)
        setHighlightFilter((_) => () => defaultFilterState)
      }
    }, 200)
  }, [query, submittedQueries, defaultFilterState])

  return {
    highlightFilter,
    error,
  };
}