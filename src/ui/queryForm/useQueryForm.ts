import { SearchOptions } from 'scryfall-sdk'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { Setter } from '../../types'
import times from 'lodash/times'
import { displayQueries } from '../../api/queries'

interface QueryFormProps {
  initialQueries?: string[] | (() => string[])
  initialOptions?: SearchOptions | (() => SearchOptions)
}

interface QueryFormState {
  queries: string[]
  setQueries: Setter<string[]>
  options: SearchOptions
  setOptions: Setter<SearchOptions>
}

export const useQueryForm = ({
  initialQueries = () => {
    const queries = times(Math.random() * 2 + 3, () =>
      Math.round(Math.random() * displayQueries.length)
    ).map((index) => displayQueries[index])
    return Array.from(new Set(queries))
  },
  initialOptions = {
    order: 'cmc',
    dir: 'auto',
  },
}: QueryFormProps): QueryFormState => {
  const [options, setOptions] = useLocalStorage<SearchOptions>(
    'search-options',
    initialOptions
  )
  const [queries, setQueries] = useLocalStorage<string[]>(
    'queries',
    initialQueries
  )

  return { options, setOptions, queries, setQueries }
}
