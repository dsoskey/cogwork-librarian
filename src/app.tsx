import React, { useCallback } from 'react'
import { BrowserView } from './ui/cardBrowser/browserView'
import { TextEditor } from './ui/textEditor'
import { useCogDB } from './api/local/useCogDB'
import { QueryForm } from './ui/queryForm/queryForm'
import { useScryfallQueryRunner } from './api/scryfall/useQueryRunner'
import { DataSource } from './types'
import { useQueryForm } from './ui/queryForm/useQueryForm'
import {
  weightAlgorithms,
  injectPrefix as _injectPrefix,
} from './api/queryRunnerCommon'
import { useLocalStorage } from './api/local/useLocalStorage'
import { useMemoryQueryRunner } from './api/memory/useQueryRunner'
import { useProject } from './api/useProject'
import { Footer } from './ui/footer'
import { useViewportListener } from './viewport'

export const App = () => {
  const { dbStatus, memoryStatus, memory } = useCogDB()
  const viewport = useViewportListener()
  const [source, setSource] = useLocalStorage<DataSource>('source', 'scryfall')

  const { addIgnoredId, ignoredIds, addCard, setSavedCards, savedCards } =
    useProject()

  const { queries, setQueries, options, setOptions, prefix, setPrefix } =
    useQueryForm({})
  const injectPrefix = useCallback(_injectPrefix(prefix), [prefix])

  const queryRunner = {
    local: useMemoryQueryRunner({
      getWeight: weightAlgorithms.zipf,
      corpus: memory,
      injectPrefix,
    }),
    scryfall: useScryfallQueryRunner({
      getWeight: weightAlgorithms.zipf,
      injectPrefix,
    }),
  }[source]

  return (
    <div className='root'>
      <div className='input-column'>
        <h1>cogwork librarian</h1>

        <div>
          {dbStatus === 'loading' && 'Indexing local database...'}
          {memoryStatus === 'loading' && 'Loading local database into memory...'}
        </div>

        <QueryForm
          prefix={prefix}
          setPrefix={setPrefix}
          status={queryRunner.status}
          canRunQuery={source === 'scryfall' || memoryStatus === 'success'}
          execute={() => queryRunner.run(queries, options)}
          queries={queries}
          setQueries={setQueries}
          options={options}
          setOptions={setOptions}
          source={source}
          setSource={setSource}
        />

        <h2>saved cards</h2>

        <TextEditor
          queries={savedCards}
          setQueries={setSavedCards}
          placeholder='add one card per line'
        />
        {viewport.desktop && <Footer />}
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
      {viewport.mobile && <Footer />}
    </div>
  )
}
