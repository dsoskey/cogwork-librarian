import { AdminPanel } from '../adminPanel'
import { CoglibIcon } from './coglibIcon'
import { Link } from 'react-router-dom'
import React, { useContext, useEffect } from 'react'
import { FlagContext } from '../flags'
import { useLocation, useParams } from 'react-router'
import { CogDBContext } from '../../api/local/useCogDB'
import { Dropdown } from './dropdown'
import _cloneDeep from 'lodash/cloneDeep'
import { useLocalStorage } from '../../api/local/useLocalStorage'

interface DatabaseLinkProps { active: boolean }

const DatabaseLink = ({ active }: DatabaseLinkProps) => {
  const { outOfDate } = useContext(CogDBContext)
  return <Link to='/data/card' className={active ? "active-link" : ""}>
    data {outOfDate && <span className='alert'>!!</span>}
  </Link>

}
export const Masthead = () => {
  const { adminMode } = useContext(FlagContext).flags
  const { pathname } = useLocation()
  const topPath = pathname.replace("/","").split("/")[0]
  const params = useParams()
  const [lastVistedCubes, setLastVisitedCubes] = useLocalStorage<string[]>("recent-cubes.coglib.sosk.watch",[]);
  useEffect(() => {
    if (pathname.startsWith("/data/cube/")) {
      const cubeId = pathname.split("/").pop();
      console.log(pathname)
      console.log(params);
      setLastVisitedCubes(prev=> {
        const next = _cloneDeep(prev);
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
  }, [pathname])

  return <div className={`row masthead`}>
    {adminMode && <AdminPanel><CoglibIcon isActive={adminMode} size='3em' /></AdminPanel>}
    {!adminMode && <CoglibIcon size='3em' />}

    <div>
      <h1 id='page-title'>cogwork librarian</h1>
      <div className='row masthead-links'>

        <Link to='/' className={pathname === "/" ? "active-link" : ""}>search</Link>

        <DatabaseLink active={pathname === '/data/card'} />

        <Dropdown
          className={pathname.startsWith("/data/cube") ? "active-link" : ""}
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
}