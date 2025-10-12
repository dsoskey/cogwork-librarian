import React, { useContext, useMemo } from 'react'
import { BulkCubeImporterContext } from '../../../api/cubecobra/useBulkCubeImporter'
import { CogDBContext } from '../../../api/local/useCogDB'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB as cogDBClient } from '../../../api/local/db'
import { Link } from 'react-router-dom'
import { LoaderText, TRIANGLES } from '../loaders'
import cubecobraImage from '../../icons/cubecobra-favicon.ico'

export interface CubeContextMenuProps {
  cubeKey: string
  handleLinkClick: () => void
}

export function CubeContextMenu({ cubeKey, handleLinkClick }: CubeContextMenuProps) {
  const { isRunning, source, missingCubes, attemptImport, attemptRefresh } = useContext(BulkCubeImporterContext)
  const { dbStatus } = useContext(CogDBContext)
  const notFound = useMemo(() => missingCubes.includes(cubeKey), [missingCubes, cubeKey, source])

  const cube = useLiveQuery(() => cubeKey.length > 0
    ? cogDBClient.getCube(cubeKey, false)
    : null,
    [cubeKey, dbStatus],
    null)

  return <>
    <div>
      <div className='column'>
        <div className='row baseline'>
          <Link className='cube-link' onClick={handleLinkClick} to={`/cube/${cubeKey}`}>{cubeKey}</Link>
          {cube === null && <LoaderText text='' frames={TRIANGLES} />}
        </div>
        {cube && cube.name && <div className='bold'>{cube.name}</div>}
        {cube && <div><span className='bold'>last updated: </span>{cube.last_updated?.toLocaleString() ?? '~'}</div>}
      </div>
      {cube && cube.cover_image && <img width='200px' src={cube.cover_image.uri} alt={cube.cover_image.card_name} />}
    </div>
    {!cube && <button
      className='row center'
      disabled={isRunning}
      onClick={() => attemptImport([cubeKey], 'cubecobra')}>
      import from cubecobra
      &nbsp;
      <img src={cubecobraImage} height='18px' />
    </button>}
    {cube && <button
      className='row center'
      disabled={isRunning}
      onClick={() => attemptRefresh({ [cube.source]: [cube] })}>
      sync from {cube.source}
      &nbsp;
      <img src={cubecobraImage} height='18px' />
    </button>}
    {notFound && <div className='alert'>{cubeKey} not found in cubecobra</div>}
  </>
}