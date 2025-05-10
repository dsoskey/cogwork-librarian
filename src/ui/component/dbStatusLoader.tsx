import { CogDBContext, DB_INIT_MESSAGES } from '../../api/local/useCogDB'
import { LoaderBar, LoaderText } from './loaders'
import React, { useContext } from 'react'

export function MemStatusLoader() {
  const { dbStatus, memError, memStatus, dbReport } = useContext(CogDBContext)

  if (dbStatus === "loading") return null

  switch (memStatus) {
    case 'unstarted':
    case 'success':
      return null
    case 'loading':
      return <div className="column">
        <span><LoaderText text='preparing the library' /></span>
        {dbReport.totalCards > 0 && <LoaderBar
          width='500px'
          count={dbReport.cardCount}
          total={dbReport.totalCards}
          label='cards loaded'
        />}
      </div>
    case 'error':
      return <pre><code className='language-none'>{memError}</code></pre>
  }
}


export function DBStatusLoader() {
  const { dbStatus, dbError, memStatus, dbReport } = useContext(CogDBContext)
  switch (dbStatus) {
    case 'loading':
      return <>
        <span><LoaderText text={DB_INIT_MESSAGES[dbReport.complete]} /></span>
        <div className='column'>
          <LoaderBar width="500px" count={dbReport.complete} total={dbReport.totalQueries} />
          {memStatus === "loading" && dbReport.totalCards > 0 && <LoaderBar
            width="500px"
            label='cards loaded'
            count={dbReport.cardCount}
            total={dbReport.totalCards}
          />}
        </div>
      </>
    case 'error':
      return <pre><code className="language-none">{dbError}</code></pre>;
    case 'success':
    case 'unstarted':
      return null;
  }
}