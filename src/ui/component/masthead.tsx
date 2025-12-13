import { AdminPanel } from '../adminPanel'
import { CoglibIcon } from '../icons/coglibIcon'
import { Link } from 'react-router-dom'
import React, { useContext, useEffect, useMemo } from 'react'
import { FlagContext } from '../flags'
import { useLocation } from 'react-router'
import { CogDBContext } from '../../api/local/useCogDB'
import { Dropdown } from './dropdown'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { LoaderBar } from './loaders'
import { Alert } from './alert/alert'
import { ErrorIcon } from '../icons/error'
import { Hoverable } from './Hoverable'

interface DatabaseLinkProps { active: boolean }

const DatabaseLink = ({ active }: DatabaseLinkProps) => {
  const { outOfDate } = useContext(CogDBContext)
  return <Link to='/data/card' className={active ? "active-link" : ""}>
    data {outOfDate && <Alert>!!</Alert>}
  </Link>

}
export const Masthead = React.memo(() => {
  const { adminMode } = useContext(FlagContext).flags
  const { pathname } = useLocation()
  const { memStatus, memError } = useContext(CogDBContext);
  const topPath = pathname.replace("/","").split("/")[0]
  const [lastVistedCubes, setLastVisitedCubes] = useLocalStorage<string[]>("recent-cubes.coglib.sosk.watch",[]);
  useEffect(() => {
    if (pathname.startsWith("/data/cube/")) {
      const cubeId = pathname.split("/").pop();
      setLastVisitedCubes(prev=> {
        const next = structuredClone(prev);
        const prevIndex = next.findIndex(it => it === cubeId);
        if (prevIndex === -1) {
          if (next.length > 4) {
            next.shift();
          }
          next.push(cubeId);
        } else {
          next.splice(prevIndex, 1)
          next.push(cubeId)
        }
        return next;
      })
    }
  }, [pathname]);

  return <div className={`row masthead`}>
    {adminMode && <AdminPanel><CoglibIcon isActive={adminMode} size='3em' /></AdminPanel>}
    {!adminMode && <CoglibIcon size='3em' />}

    <div>
      <div className="page-title-container">
        <h1 id='page-title'>cogwork librarian</h1>
        {/*{dbStatus !== 'loading' && memStatus === 'loading' && <LoaderBar width="100%" count={dbReport.cardCount} total={dbReport.totalCards} />}*/}
        <MastheadLoaderBar />
        {memStatus === 'error' && <Hoverable
          hoverElement={<pre className='hover-error'><code className="language-none">{memError}</code></pre>}
        >
          <ErrorIcon className='error-indicator' />
        </Hoverable>}
      </div>
      <div className='row masthead-links'>

      <Link to='/' className={pathname === "/" ? "active-link" : ""}>search</Link>

        <Link to='/graph-search' className={pathname === "/graph-search" ? "active-link" : ""}>graph</Link>

        <Link to='/list' className={pathname === "/list" ? "active-link" : ""}>list</Link>

        <DatabaseLink active={pathname === '/data/card'} />

        <Dropdown
          className={pathname.startsWith("/cube") ? "active-link" : ""}
          options={(close) =>
            lastVistedCubes.length > 0
              ? lastVistedCubes.map(it => <Link key={it} to={`/data/cube/${it}`} onClick={close}>{it}</Link>)
              : <div>recently viewed cubes appear here!</div>
        }
        >
          <Link to="/data/cube">cube</Link>
        </Dropdown>

        <Link to="/settings" className={topPath === "settings" ? "active-link" : ""}>settings</Link>

        <Link to='/about-me' className={topPath === "about-me" ? "active-link" : ""}>about me</Link>

        <Link to='/user-guide' className={topPath === "user-guide" ? "active-link" : ""}>user guide</Link>
      </div>
    </div>
  </div>
});

function MastheadLoaderBar() {
  const { memStatus, dbStatus, dbReport } = useContext(CogDBContext)

  const count = useMemo(() => {
    if (memStatus === 'error' || dbStatus === 'error')
      return 1;
    return memStatus === 'success' ? dbReport.totalCards : dbReport.cardCount
  }, [memStatus, dbStatus, dbReport]);
  const total = (memStatus === 'error' || dbStatus === 'error')
    ? 1
    : dbReport.totalCards;

  return <LoaderBar
    className={memStatus}
    height={4} width={249}
    count={count}
    total={total}
  />
}