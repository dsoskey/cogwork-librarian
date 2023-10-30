import { CogDBContext, DB_INIT_MESSAGES, DB_LOAD_MESSAGES } from '../../api/local/useCogDB'
import { Loader } from './loader'
import React, { useContext } from 'react'

export const DBStatusLoader = () => {
  const { dbStatus, memStatus, dbReport } = useContext(CogDBContext)
  return <div className='db-info-holder'>
    {dbStatus === 'loading' && <>
      <span>{DB_INIT_MESSAGES[dbReport.complete]}</span>
      <div className='column'>
        <Loader width="100%" count={dbReport.complete} total={dbReport.totalQueries} />
        {memStatus === "loading" && dbReport.totalCards > 0 && <Loader
          width="100%" label='cards loaded'
          count={dbReport.cardCount} total={dbReport.totalCards}
        />}
      </div>
    </>}
    {dbStatus !== 'loading' && memStatus === "loading" && <>
      <span>{DB_LOAD_MESSAGES[dbReport.complete]}</span>
      {dbReport.totalCards > 0 && <Loader
        width="100%"
        count={dbReport.cardCount}
        total={dbReport.totalCards}
        label='cards loaded'
      />}
    </>}
  </div>
}