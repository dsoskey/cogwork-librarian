import { CogDBContext, DB_INIT_MESSAGES } from '../../api/local/useCogDB'
import { LoaderBar, LoaderText } from './loaders'
import React, { useContext } from 'react'

export const DBStatusLoader = () => {
  const { dbStatus, memStatus, dbReport } = useContext(CogDBContext)
  return <div className='db-info-holder'>
    {dbStatus === 'loading' && <>
      <span><LoaderText text={DB_INIT_MESSAGES[dbReport.complete]} /></span>
      <div className='column'>
        <LoaderBar width="100%" count={dbReport.complete} total={dbReport.totalQueries} />
        {memStatus === "loading" && dbReport.totalCards > 0 && <LoaderBar
          width="100%" label='cards loaded'
          count={dbReport.cardCount} total={dbReport.totalCards}
        />}
      </div>
    </>}
    {dbStatus !== 'loading' && memStatus === "loading" && <>
      <span><LoaderText text="preparing the library" /></span>
      {dbReport.totalCards > 0 && <LoaderBar
        width="100%"
        count={dbReport.cardCount}
        total={dbReport.totalCards}
        label='cards loaded'
      />}
    </>}
  </div>
}