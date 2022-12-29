import React, { useCallback, useState } from 'react'
import { Results } from './results'
import { TextEditor } from './textEditor'
import { useQueryRunner, weightAlgorithms } from './useQueryRunner'
import { useCogDB } from './local/useCogDB'
import { QueryForm } from './queryForm'

export const App = () => {
    const [cardList, setCardList] = useState<string[]>([])
    const addCard = useCallback((next) => setCardList(prev => [...prev.filter(it => it.length > 0), next]), [setCardList])
    const { execute, report,
        queries, setQueries,
        options, setOptions,
        status, result,
    } = useQueryRunner({ getWeight: weightAlgorithms.zipf })
    const { status: dbStatus } = useCogDB()

    return (
        <div className="root">
            <div className="input-column">
                <h1>cogwork librarian</h1>

                {dbStatus === 'loading' && 'Indexing local database...'}

                {dbStatus === 'success' && <QueryForm execute={execute}
                    queries={queries} setQueries={setQueries}
                    options={options} setOptions={setOptions}
                />}

                <h2>saved cards</h2>

                <TextEditor 
                    queries={cardList}
                    setQueries={setCardList}
                    placeholder='add one card per line'
                />
            </div>

            <Results report={report} result={result} status={status} addCard={addCard} />
        </div>
    )
}