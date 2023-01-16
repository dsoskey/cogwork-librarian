import React from 'react'
import { BrowserView } from './ui/cardBrowser/browserView'
import { TextEditor } from './ui/textEditor'
import { useCogDB } from './api/local/useCogDB'
import { QueryForm } from './ui/queryForm/queryForm'
import { useScryfallQueryRunner } from './api/scryfall/useQueryRunner'
import { DataSource } from './types'
import { useQueryForm } from './ui/queryForm/useQueryForm'
import { weightAlgorithms } from './api/queryRunnerCommon'
import { useLocalStorage } from './api/local/useLocalStorage'
import { useMemoryQueryRunner } from "./api/memory/useQueryRunner"
import { useProject } from "./api/useProject";

export const App = () => {
    const { dbStatus, memoryStatus, memory } = useCogDB()
    const [source, setSource] = useLocalStorage<DataSource>("source","scryfall")

    const {
        addIgnoredId, ignoredIds,
        addCard, setSavedCards, savedCards
    } = useProject()

    const {
        queries, setQueries,
        options, setOptions,
    } = useQueryForm({})

    const queryRunner = {
        local: useMemoryQueryRunner({
            getWeight: weightAlgorithms.zipf,
            corpus: memory,
        }),
        scryfall: useScryfallQueryRunner({
            getWeight: weightAlgorithms.zipf,
        }),
    }[source]

    return (
        <div className="root">
            <div className="input-column">
                <h1>cogwork librarian</h1>

                {dbStatus === 'loading' && 'Indexing local database...'}
                {memoryStatus === 'loading' && 'Loading local database into memory...'}

                {memoryStatus === 'success' && <QueryForm
                    status={queryRunner.status}
                    execute={() => queryRunner.run(queries, options)}
                    queries={queries} setQueries={setQueries}
                    options={options} setOptions={setOptions}
                    source={source} setSource={setSource}
                />}

                <h2>saved cards</h2>

                <TextEditor 
                    queries={savedCards}
                    setQueries={setSavedCards}
                    placeholder='add one card per line'
                />
            </div>

            <BrowserView
                report={queryRunner.report}
                result={queryRunner.result}
                status={queryRunner.status}
                addCard={addCard}
                addIgnoredId={addIgnoredId}
                ignoredIds={ignoredIds}
                source={source}
            />
        </div>
    )
}