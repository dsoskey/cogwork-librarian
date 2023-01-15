import React, {useCallback, useMemo, useState} from 'react'
import { BrowserView } from './ui/cardBrowser/browserView'
import { TextEditor } from './ui/textEditor'
import { useCogDB } from './api/local/useCogDB'
import { QueryForm } from './ui/queryForm/queryForm'
import { useScryfallQueryRunner } from './api/scryfall/useQueryRunner'
import { DataSource } from './types'
import { useQueryForm } from './ui/queryForm/useQueryForm'
import { weightAlgorithms } from './api/queryRunnerCommon'
import { useLocalStorage } from './api/local/useLocalStorage'
import {useMemoryQueryRunner} from "./api/memory/useQueryRunner"

export const App = () => {
    const { dbStatus, memoryStatus, memory } = useCogDB()
    const [source, setSource] = useLocalStorage<DataSource>("source","scryfall")
    const [cardList, setCardList] = useLocalStorage<string[]>("saved-cards", [])
    const addCard = useCallback((next) => setCardList(prev => [...prev.filter(it => it.length > 0), next]), [setCardList])
    const localQueryRunner = useMemoryQueryRunner({
        getWeight: weightAlgorithms.zipf,
        corpus: memory,
    })
    const scryQueryRunner = useScryfallQueryRunner({
        getWeight: weightAlgorithms.zipf,
    })

    const {
        queries, setQueries,
        options, setOptions,
    } = useQueryForm({ initialQueries: [
        `o:"whenever ~ deals"`,
        `o=extra`
    ]})

    const queryRunner = {
        local: localQueryRunner,
        scryfall: scryQueryRunner,
    }[source]

    return (
        <div className="root">
            <div className="input-column">
                <h1>cogwork librarian</h1>

                {dbStatus === 'loading' && 'Indexing local database...'}
                {memoryStatus === 'loading' && 'Loading local database into memory...'}

                {memoryStatus === 'success' && <QueryForm
                    status={queryRunner.status}
                    execute={() => queryRunner.execute(queries, options)}
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

            <BrowserView
                report={queryRunner.report}
                result={queryRunner.result}
                status={queryRunner.status}
                addCard={addCard}
                source={source}
            />
        </div>
    )
}