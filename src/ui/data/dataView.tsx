import React, { useState } from 'react'
import { CardDataView } from './cardDataView'
import { CubeImporter } from './cubeImporter'

export const DataView = () => {
  const [dataTarget, setDataTarget] = useState<'card'| 'cube'>('card')
  return <div className='root-data-view'>
    <section>
      <h3>i want to manage{" "}
      <label htmlFor='manage-card'>
        <input
          id='manage-card'
          type={'radio'}
          value='card'
          checked={dataTarget === 'card'}
          onChange={() => setDataTarget('card')}
        />
        <span>cards</span>
      </label>
      <label htmlFor='manage-cube'>
        <input
          id='manage-cube'
          type={'radio'}
          value='cube'
          checked={dataTarget === 'cube'}
          onChange={() => setDataTarget('cube')}
        />
        <span>cubes</span>
      </label>
      </h3>
    </section>
    {dataTarget === 'card' && <CardDataView/>}
    {dataTarget === 'cube' && <CubeImporter/>}
  </div>
}