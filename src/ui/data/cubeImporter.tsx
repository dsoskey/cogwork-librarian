import React, { useContext, useState } from 'react'
import { CogDBContext } from '../../api/local/useCogDB'
import { cogDB } from '../../api/local/db'
import { NormedCard } from '../../api/memory/types/normedCard'
import { useLiveQuery } from 'dexie-react-hooks'
import { IMPORT_SOURCE, ImportSource, sourceToLabel } from './cardDataView'
import { CubeCobraImporter } from './cubeCobraImporter'
import { isFunction } from 'lodash'
import { DISMISS_TIMEOUT_MS, ToasterContext } from '../component/toaster'

// AB test idea: add an import list from cubecobra button on the list importer?
export const NewCubeImporter = () => {
  const { addMessage, dismissMessage } = useContext(ToasterContext)
  const { setMemory } = useContext(CogDBContext)
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
      const oracleSet = new Set(oracle_ids)
      await cogDB.addCube({ key, oracle_ids })
      setMemory(prev => {
        for (const card of prev) {
          if (oracleSet.has(card.oracle_id)) {
            if (card.cube_ids === undefined) {
              card.cube_ids = new Set()
            }
            card.cube_ids.add(key)
          }
        }
        return prev
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