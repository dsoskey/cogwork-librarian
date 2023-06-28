import React, { useContext, useState } from 'react'
import { CogDBContext } from '../../api/local/useCogDB'
import { cogDB } from '../../api/local/db'
import { NormedCard } from '../../api/memory/types/normedCard'
import { useLiveQuery } from 'dexie-react-hooks'
import { IMPORT_SOURCE, ImportSource, sourceToLabel } from './cardDataView'
import { CubeCobraImporter } from './cubeCobraImporter'
import { isFunction } from 'lodash'
import { DISMISS_TIMEOUT_MS, ToasterContext } from '../component/toaster'

const cubeNamespace = ".cube.coglib.sosk.watch"

// AB test idea: add an import list from cubecobra button on the list importer?
// TODO: update cards in memory to use new cube id
// TODO: help migrate localstorage jawns
export const NewCubeImporter = () => {
  const { addMessage, dismissMessage } = useContext(ToasterContext)
  const [cubeId, setCubeId] = useState("")
  const [error, setError] = useState("")
  const [foundCards, setFoundCards] = useState<NormedCard[]>([])
  const [importType, setImportType] = useState<ImportSource>("cubeCobra")

  const existingCubes = useLiveQuery(() => cogDB.cube.toArray())

  const [showConfirmation, setShowConfirmation] = useState(false)

  const saveCubeToDB = async (cards: NormedCard[]) => {
    const key = cubeId.trim()
    if (key.length === 0) {
      setError("cube id must not be blank")
      setShowConfirmation(false)
    } else if (existingCubes.find(it => key === it.key) !== undefined && !showConfirmation) {
      setError("")
      setShowConfirmation(true)
    } else {
      const oracle_ids = cards.map(it => it.oracle_id)
      await cogDB.transaction("rw", cogDB.cube, cogDB.card, async () => {
        await cogDB.cube.put({ key, oracle_ids })
        await cogDB.card.where("oracle_id").anyOf(oracle_ids)
          .modify(it => {
            if (it.cube_ids === undefined) {
              it.cube_ids = new Set()
            }
            it.cube_ids.add(key)
          })
      })
      setCubeId("")
      setError("")
      setShowConfirmation(false)
      const id = addMessage(`successfully added ${cubeId} to cube list`, false)
      setTimeout(() => {
        dismissMessage(id)
      }, DISMISS_TIMEOUT_MS)
    }
  }

  const handleSaveClick = () => {
    saveCubeToDB(foundCards)
      .catch(err => {
        setError(JSON.stringify(err))
        setShowConfirmation(false)
      })
  }

  const onCubeIdChange = event => {
    setCubeId(event.target.value)
    setShowConfirmation(false)
  }

  return <section className='cube-import'>
    <h3>manage cube lists</h3>
    <p>local <code className='language-scryfall-extended'>cube:</code> queries match against these cube ids</p>

    <div>
      <strong>saved cube ids:</strong>
      {existingCubes === undefined && <span>{" "}loading cubes...</span>}
      {existingCubes?.length === 0 && <span>{" "}no cubes saved!</span>}
      {existingCubes?.length > 0 && <ul>
        {existingCubes.map(({ key }) => <li key={key}>{key}</li>)}
      </ul>}
    </div>

    <label>
      <strong>new cube id:{" "}</strong>
      <input value={cubeId} onChange={onCubeIdChange}/>
      {error && <div className='alert'>{error}</div>}
    </label>

    <h4>
      import from{" "}
      {Object.keys(IMPORT_SOURCE).filter(it => it !== "scryfall").map(source => (<React.Fragment key={source}>
        <input
          id={`import-${source}`}
          type='radio'
          value={source}
          checked={source === importType}
          onChange={() => setImportType(source as ImportSource)}
        />
        <label htmlFor={`import-${source}`}>{sourceToLabel[source]}</label>
      </React.Fragment>))}
    </h4>
    {importType === "cubeCobra" && <CubeCobraImporter
      cubeId={cubeId}
      setError={setError}
      setCards={(cards) => {
        setFoundCards(cards)
        const _cards = isFunction(cards) ? cards(foundCards) : cards
        saveCubeToDB(_cards)
      }}
    />}

    <div className='submit'>
      {showConfirmation && <>
        <div>you've picked an existing cube id. would you like to overwrite this cube id?</div>
        <button onClick={() => setShowConfirmation(false)}>don't overwrite</button>
        <button onClick={handleSaveClick}>overwrite cube</button>
      </>}
    </div>
  </section>
}

export const CubeImporter = () => {
  const [cubeId, setCubeId] = useState("")
  const [error, setError] = useState("")
  const { memory } = useContext(CogDBContext)
  const [keys, setKeys] = useState(Object.keys(localStorage)
    .filter(it => it.endsWith(cubeNamespace))
    .map(it => it.slice(0, it.indexOf("."))))
  const [showConfirmation, setShowConfirmation] = useState(false)

  const writeMemoryToCube = () => {
    const trimmed = cubeId.trim()
    if (trimmed.length === 0) {
      setError("cube id must not be blank")
    } else if (keys.find(it => trimmed === it) !== undefined && !showConfirmation) {
      setShowConfirmation(true)
      setError("")
    } else {
      const payload = memory.map(it => it.oracle_id)
      cogDB.card.where("oracle_id").anyOf(payload).modify(it => it.cube_ids.add(trimmed))
      localStorage.setItem(`${trimmed}${cubeNamespace}`, JSON.stringify(payload))
      setKeys(prev => [...prev, trimmed])
      setCubeId("")
      setError("")
      setShowConfirmation(false)
    }
  }
  const onCubeIdChange = event => {
    setCubeId(event.target.value)
    setShowConfirmation(false)
  }

  return <section className='cube-import'>
    <h3>manage cube lists</h3>
    <p>local <code className='language-scryfall-extended'>cube:</code> queries match against these cube ids</p>

    <div>
      <strong>saved cube ids:</strong>
      {keys.length === 0 && <span>{" "}no cubes saved!</span>}
      {keys.length > 0 && <ul>
        {keys.map(key => <li key={key}>{key}</li>)}
      </ul>}
    </div>

    <label>
      <strong>new cube id:{" "}</strong>
      <input value={cubeId} onChange={onCubeIdChange}/>
      {error && <div className='alert'>{error}</div>}
    </label>

    <div className='submit'>
      {!showConfirmation && <button onClick={writeMemoryToCube}>save memory as cube list</button>}
      {showConfirmation && <>
        <div>you've picked an existing cube id. would you like to overwrite this cube id?</div>
        <button onClick={() => setShowConfirmation(false)}>don't overwrite</button>
        <button onClick={writeMemoryToCube}>overwrite cube</button>
      </>}
    </div>
  </section>
}