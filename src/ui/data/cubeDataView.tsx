import React, { useContext, useState } from 'react'
import { cogDB } from '../../api/local/db'
import { NormedCard, CubeSource, CUBE_SOURCE_OPTIONS } from 'mtgql'
import { useLiveQuery } from 'dexie-react-hooks'
import { BulkCubeSiteImporter } from './bulkCubeSiteImporter'
import { isFunction, sortBy } from 'lodash'
import { DISMISS_TIMEOUT_MS, ToasterContext } from '../component/toaster'
import { ListImporterContext } from '../../api/local/useListImporter'
import { LoaderBar } from '../component/loaders'
import { CubeListImporter } from './cubeListImporter'
import { Setter } from '../../types'
import { CubeTable } from '../component/cube/cubeDefinitionTable'
import { BulkCubeImporterContext } from '../../api/cubecobra/useBulkCubeImporter'
import { CUBE_SOURCE_TO_LABEL } from '../component/cube/sourceIcon'

export const CubeDataView = () => {
  const { addMessage, dismissMessage } = useContext(ToasterContext)

  const [cubeId, setCubeId] = useState("")
  const [cardsToImport, setCardsToImport] = useState<string[]>([])

  const [error, setError] = useState("")
  const [foundCards, setFoundCards] = useState<NormedCard[]>([])

  const { setSource, status, isRunning } = useContext(BulkCubeImporterContext)
  const [importType, setImportType] = useState<CubeSource | undefined>(undefined)

  const listImporter = useContext(ListImporterContext)

  const existingCubes = useLiveQuery(
    async () => sortBy(await cogDB.cube.toArray(), [(it) => it.key.toLowerCase()]),
    [status, isRunning],
  )

  const [showConfirmation, setShowConfirmation] = useState(false)

  const saveCubeToDB = async (cards: NormedCard[]) => {
    listImporter.abandonImport()
    const key = cubeId.trim()
    if (key.length === 0) {
      setError("cube id must not be blank")
      setShowConfirmation(false)
    } else if (existingCubes.find(it => key === it.key) !== undefined && !showConfirmation) {
      setError("")
      setShowConfirmation(true)
    } else {
      const now = new Date();
      await cogDB.cube.put({ key,
        cards: cards.map(it => ({ print_id: it.printings[0].id, oracle_id: it.oracle_id })),
        oracle_ids:[],
        print_ids:[],
        name: key,
        description: "",
        canonical_id: key,
        source: "list",
        last_updated: now,
        last_source_update: now,
        created_by: "",
      })
      setCubeId("")
      setCardsToImport([])
      setError("")
      setShowConfirmation(false)
      const id = addMessage(`successfully added ${cubeId} to cube list`, false)
      setTimeout(() => {
        dismissMessage(id)
      }, DISMISS_TIMEOUT_MS)
    }
  }

  const handleOverwrite = () => {
    saveCubeToDB(foundCards)
      .then(() => {
        setError("")
        setShowConfirmation(false)
      })
      .catch(err => {
        setError(JSON.stringify(err))
        setShowConfirmation(false)
      })
  }

  const onCubeIdChange = event => {
    setCubeId(event.target.value)
    setShowConfirmation(false)
  }

  const setCards: Setter<NormedCard[]> = (cards) => {
    setFoundCards(cards)
    const _cards = isFunction(cards) ? cards(foundCards) : cards
    saveCubeToDB(_cards)
  }

  const retrySearch = () => {
    listImporter.attemptImport(listImporter.missing, false)
      .then(saveCubeToDB)
      .catch(e => setError(e.toString()))
  }

  const CubeIdInput = <label>
    <span className="bold">new cube id:{" "}</span>
    <input placeholder='soskgy' value={cubeId} onChange={onCubeIdChange}/>
    {error && <div className='alert'>{error}</div>}
  </label>

  const loader = listImporter.status === "loading" ? (
      <LoaderBar
        label="cards found"
        width={400}
        count={listImporter.report.complete}
        total={listImporter.report.totalQueries}
      />
    ) : undefined

  return <>
    <h2>cubes</h2>
    <p>local <code className='language-scryfall-extended'>cube:</code> queries match against these cube ids</p>

    <CubeTable cubes={existingCubes} />

    <section className='cube-import'>
    <h3 className='row baseline'>
      <span>import from: </span>
      {['cubecobra', 'list'].map((sourceOption: CubeSource) => (<label key={sourceOption}
        className={`input-link ${sourceOption === importType ? "active-link" : ""}`}
      >
        <input
          id={`import-${sourceOption}`}
          type='radio'
          value={sourceOption}
          checked={sourceOption === importType}
          onChange={() => {
            setImportType(sourceOption)
            if (sourceOption !== "list") setSource(sourceOption)
          }}
        />
        {CUBE_SOURCE_TO_LABEL[sourceOption]}
      </label>))}
    </h3>
    {importType && importType !== "list" && <BulkCubeSiteImporter />}
    {importType && importType === "list" && <CubeListImporter
      cardsToImport={cardsToImport}
      setCardsToImport={setCardsToImport}
      setCards={setCards}
      setError={setError}
      loader={loader}
    >
      {CubeIdInput}
    </CubeListImporter>}

    {listImporter.status === "error" && <>
      <p>the importer failed to find {listImporter.missing.length} card name{listImporter.missing.length === 1 ? "":"s"}. make any edits you need before retrying card search, or import the {listImporter.result.length} found card{listImporter.result.length === 1 ? "": "s"} as is</p>
      <textarea
        className='cards-to-import coglib-prism-theme'
        value={listImporter.missing.join('\n')}
        spellCheck={false}
        rows={9}
        onChange={(event) => {
          listImporter.setMissing(event.target.value.split('\n'))
        }}
      />
      <div>
        <button onClick={retrySearch}>retry search</button>
        <button onClick={() => saveCubeToDB(listImporter.result)}>import found cards</button>
      </div>

    </>}

    {showConfirmation && <div className='submit'>
      <p>you've picked an existing cube id. would you like to overwrite this cube id?</p>
      <button onClick={() => setShowConfirmation(false)}>don't overwrite</button>
      <button onClick={handleOverwrite}>overwrite cube</button>
    </div>}
  </section>
  </>
}