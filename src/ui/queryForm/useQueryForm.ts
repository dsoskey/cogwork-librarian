import { SearchOptions } from 'scryfall-sdk'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { Setter } from '../../types'
import times from 'lodash/times'
import { displayQueries } from '../../api/queries'

interface QueryFormProps {
  initialQueries?: string[] | (() => string[])
  initialOptions?: SearchOptions | (() => SearchOptions)
  initialPrefix?: string | (() => string)
}

export interface QueryFormFields {
  queries: string[]
  prefix: string
  options: SearchOptions
}
interface QueryFormState extends QueryFormFields {
  setQueries: Setter<string[]>
  setOptions: Setter<SearchOptions>
  setPrefix: Setter<string>
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
  initialPrefix = '-is:token',
}: QueryFormProps): QueryFormState => {
  const [options, setOptions] = useLocalStorage<SearchOptions>(
    'search-options',
    initialOptions
  )
  const [queries, setQueries] = useLocalStorage<string[]>(
    'queries',
    initialQueries
  )
  const [prefix, setPrefix] = useLocalStorage<string>('prefix', initialPrefix)

  return { options, setOptions, queries, setQueries, prefix, setPrefix }
}
