import React, { useCallback, useState } from 'react'
import { BrowserView } from './ui/cardBrowser/browserView'
import { TextEditor } from './ui/textEditor'
import { useQueryRunner } from './api/local/useQueryRunner'
import { useCogDB } from './api/local/useCogDB'
import { QueryForm } from './ui/queryForm/queryForm'
import { useScryfallQueryRunner } from './api/scryfall/useQueryRunner'
import { DataSource } from './types'
import { useQueryForm } from './ui/queryForm/useQueryForm'
import { weightAlgorithms } from './api/queryRunnerCommon'
import { useLocalStorage } from './api/local/useLocalStorage'

export const App = () => {
    const [source, setSource] = useLocalStorage<DataSource>("source.coglib.sosk.watch","scryfall")
    const [cardList, setCardList] = useState<string[]>([])
    const addCard = useCallback((next) => setCardList(prev => [...prev.filter(it => it.length > 0), next]), [setCardList])
    const localQueryRunner = useQueryRunner({ getWeight: weightAlgorithms.zipf })
    const scryQueryRunner = useScryfallQueryRunner({ getWeight: weightAlgorithms.zipf })
    const { status: dbStatus } = useCogDB()
    const {
        queries, setQueries,
        options, setOptions,
    } = useQueryForm({ initialQueries: [
        `o:"whenever ~ deals"`,
        `o=extra`
    ]})
    const { execute, report,
        status, result,
    } = {
        local: localQueryRunner,
        scryfall: scryQueryRunner,
    }[source]

    return (
        <div className="root">
            <div className="input-column">
                <h1>cogwork librarian</h1>

                {dbStatus === 'loading' && 'Indexing local database...'}

                {dbStatus === 'success' && <QueryForm
                    status={status} execute={() => execute(queries, options)}
                    queries={queries} setQueries={setQueries}
                    options={options} setOptions={setOptions}
                    source={source} setSource={setSource}
                />}

                <h2>saved cards</h2>

                <TextEditor 
                    queries={cardList}
                    setQueries={setCardList}
                    placeholder='add one card per line'
                />
            </div>

            <BrowserView report={report} result={result} status={status} addCard={addCard} />
        </div>
    )
}