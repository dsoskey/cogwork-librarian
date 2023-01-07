import { SearchOptions } from "scryfall-sdk";
import { useLocalStorage } from "../../api/local/useLocalStorage";
import { Setter } from "../../types";

interface QueryFormProps {
    initialQueries?: string[] | (() => string[]),
    initialOptions?: SearchOptions | (() => SearchOptions),
}

interface QueryFormState {
    queries: string[]
    setQueries: Setter<string[]>
    options: SearchOptions
    setOptions: Setter<SearchOptions>
}

export const useQueryForm = ({
    initialQueries = [
        'o:/sacrifice a.*:/ t:artifact',
        'o:/sacrifice a.*:/ t:creature',
        'o:/add {.}\\./'
    ],
    initialOptions = {
        order: 'cmc',
        dir: 'auto',
    },
}: QueryFormProps): QueryFormState => {
    const [options, setOptions] = useLocalStorage<SearchOptions>("search-options", initialOptions)
    const [queries, setQueries] = useLocalStorage<string[]>("queries", initialQueries)
    
    return { options, setOptions, queries, setQueries }
}