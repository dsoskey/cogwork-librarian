import React from 'react'
import { CardDataView } from './cardDataView'
import { CubeDataView } from './cubeDataView'
import "./dataView.css"
import { Link } from 'react-router-dom'
import { Route, Routes, useLocation } from 'react-router'

export const DataView = () => {
  const { pathname } = useLocation()
  return <div className='data-view-root'>
    <section>
      <h3 className='row'>
        <span>i want to manage</span>
        <Link to='/data/card' className={`input-link ${pathname === '/data/card' ? 'active-link': ""}`}>
          cards
        </Link>
        <Link to='/data/cube' className={`input-link ${pathname === '/data/cube' ? 'active-link': ""}`}>
          cubes
        </Link>

      </h3>
    </section>
    <Routes>
      <Route path='card' element={<CardDataView/>}/>
      <Route path='cube' element={<CubeDataView/>}/>
    </Routes>
  </div>
}