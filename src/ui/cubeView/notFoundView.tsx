import { useParams } from 'react-router'
import { useBulkCubeImporter } from '../../api/cubecobra/useBulkCubeImporter'
import React, { useEffect, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LoaderText } from '../component/loaders'

export function CubeNotFoundView() {
  const { key } = useParams()
  const cubekey = key
  const { attemptImport, isRunning, missingCubes, source, setSource } = useBulkCubeImporter()
  const notFound = useMemo(() => missingCubes.includes(cubekey), [missingCubes, cubekey, source])
  let [searchParams] = useSearchParams()
  useEffect(() => {
    const source = searchParams.get('source')
    if (source === 'cubecobra' || source === 'cubeartisan') {
      setSource(source)
      attemptImport([cubekey], source)
    }
  }, [searchParams])

  return <div className='header row baseline'>
    <h2>{cubekey} not found in local database</h2>
    <div>
      <button disabled={isRunning} onClick={() => {
        setSource('cubeartisan')
        attemptImport([cubekey], 'cubeartisan')
      }}>import from cubeartisan
      </button>
      <button disabled={isRunning} onClick={() => {
        setSource('cubecobra')
        attemptImport([cubekey], 'cubecobra')
      }}>import from cubecobra
      </button>
    </div>
    {notFound && <div className='alert'>{cubekey} not found in {source}</div>}
    {isRunning && <LoaderText text={`Fetching ${cubekey} from ${source}`} />}
  </div>
}