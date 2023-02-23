import { SearchOptions } from 'scryfall-sdk'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { Setter } from '../../types'
import { QueryExample } from '../../api/example'

interface QueryFormProps {
  initialOptions?: SearchOptions | (() => SearchOptions)
  example: () => QueryExample
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
  initialOptions = {
    order: 'cmc',
    dir: 'auto',
  },
  example,
}: QueryFormProps): QueryFormState => {
  const _ex = example()
  console.log(_ex)
  const [options, setOptions] = useLocalStorage<SearchOptions>(
    'search-options',
    initialOptions
  )
  const [queries, setQueries] = useLocalStorage<string[]>(
    'queries',
    _ex.queries
  )
  const [prefix, setPrefix] = useLocalStorage<string>('prefix', _ex.prefix)

  return { options, setOptions, queries, setQueries, prefix, setPrefix }
}
