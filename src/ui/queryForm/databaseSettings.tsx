import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { CogDBContext } from '../../api/local/useCogDB'

export interface DatabaseSettingsProps {}

export const DatabaseLink = () => {
  const { outOfDate } = useContext(CogDBContext)
  return <Link to='/data'>settings {outOfDate && <span className='alert'>!!</span>}</Link>

}

export const DatabaseSettings = ({}: DatabaseSettingsProps) => {
  const { outOfDate } = useContext(CogDBContext)
  return (
    <div className='row'>
      <Link to='/data'>
        <button className='db-settings' title='settings'>
          ⚙
        </button>
      </Link>
      {outOfDate && <span className='alert'>DATABASE UPDATE REQUIRED</span>}
    </div>
  )
}
