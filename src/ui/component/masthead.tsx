import { AdminPanel } from '../adminPanel'
import { CoglibIcon } from './coglibIcon'
import { Link } from 'react-router-dom'
import { DatabaseLink } from '../queryForm/databaseSettings'
import React, { useContext } from 'react'
import { FlagContext } from '../../flags'
import { useLocation } from 'react-router'

export const Masthead = () => {
  const { adminMode } = useContext(FlagContext).flags
  const { pathname } = useLocation()
  const topPath = pathname.replace("/","").split("/")[0]

  return <div className={`row masthead`}>
    {adminMode && <AdminPanel><CoglibIcon isActive={adminMode} size='3em' /></AdminPanel>}
    {!adminMode && <CoglibIcon size='3em' />}

    <div>
      <h1 className='page-title'>cogwork librarian</h1>
      <div className='row'>

        <Link to='/' className={pathname === "/" ? "active-link" : ""}>search</Link>

        <DatabaseLink active={topPath === 'data'} />

        <Link to='/about-me' className={topPath === "about-me" ? "active-link" : ""}>about me</Link>

        <Link to='/examples' className={topPath === "examples" ? "active-link" : ""}>examples</Link>

        <Link to='/user-guide' className={topPath === "user-guide" ? "active-link" : ""}>syntax guide</Link>

      </div>
    </div>
  </div>
}