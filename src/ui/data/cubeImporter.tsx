import React, { useContext, useState } from 'react'
import { CogDBContext } from '../../api/local/useCogDB'

const cubeNamespace = ".cube.coglib.sosk.watch"
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
    } else if (keys.find(it => cubeId === it) !== undefined && !showConfirmation) {
      setShowConfirmation(true)
      setError("")
    } else {
      const payload = JSON.stringify(memory.map(it => it.oracle_id))
      localStorage.setItem(`${cubeId}${cubeNamespace}`, payload)
      setKeys(prev => [...prev, cubeId])
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