import React, { useContext } from 'react'
import { cogDB as cogDBClient } from '../../api/local/db'
import { CardImageView } from '../cardBrowser/cardViews/cardImageView'
import './cubeView.css'
import { CUBE_SOURCE_TO_LABEL, cubeLink } from '../component/cube/sourceIcon'
import { Modal } from '../component/modal'
import { RefreshButton } from '../component/cube/refreshButton'
import { ScryfallIcon } from '../component/scryfallIcon'
import { LoaderText } from '../component/loaders'
import { CopyToClipboardButton } from '../component/copyToClipboardButton'
import { CubeNotFoundView } from './notFoundView'
import {
  CubeViewModelContext,
  useCubeViewModel
} from './useCubeViewModel'
import { Route, Routes, useLocation } from 'react-router'
import { CubeOverview } from './cubeOverview'
import { CubeList } from './cubeList'
import { Link } from 'react-router-dom'

const shareButtonText = {
  unstarted: '🔗',
  success: '✅',
  error: '🚫',
}

export function CubeView() {
  const cubeViewModel = useCubeViewModel();
  const { cube, oracleMap, activeCard, setActiveCard } = cubeViewModel;

  const onPrintSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const normedCard = oracleMap[activeCard.oracle_id][0]
    const nextPrint = normedCard.printings.find(p => p.id === e.target.value)
    setActiveCard({...activeCard, ...nextPrint})
  }

  const saveActiveCard = () => {
    if (activeCard && cube.cards[activeCard.index].print_id !== activeCard.id) {
      const cards = [
        ...cube.cards.slice(0, activeCard.index),
        { oracle_id: activeCard.oracle_id, print_id: activeCard.id },
        ...cube.cards.slice(activeCard.index + 1)
      ];
      const newCube = {
        ...cube,
        cards,
      }
      cogDBClient.cube.put(newCube)
        .then(() => setActiveCard(undefined))
        .catch(console.error)
    } else {
      setActiveCard(undefined)
    }
  }

  return <CubeViewModelContext.Provider value={cubeViewModel}>
    <div className='cube-view-root'>
      {cube === null && <div className='header'><h2><LoaderText /></h2></div>}
      {cube === undefined && <CubeNotFoundView />}
      {cube && <CubeModelView />}
    </div>
    <Modal
      open={activeCard !== undefined}
      title={<div className="row center">
        <h2>{activeCard?.name} –</h2>
        <a href={activeCard?.scryfall_uri.replace(/\?.+$/, "")}
           rel='noreferrer'
           target='_blank'
           title="view on scryfall "
        ><ScryfallIcon size="1.5em" /></a>
      </div>}
      onClose={() => setActiveCard(undefined)}>
      {activeCard && <>
          <CardImageView card={{ data: activeCard, matchedQueries: [`cube:${cube.key}`], weight: 1 }} />
          <div>
            <select value={activeCard.id} onChange={onPrintSelect}>
              {oracleMap[activeCard.oracle_id][0]
                .printings.map(printing =>
                  <option key={printing.id} value={printing.id}>
                    {printing.set_name} – ({printing.set} {printing.collector_number})
                  </option>)}
            </select>
            <button onClick={saveActiveCard}>save</button>
        </div>
      </>}
    </Modal>
  </CubeViewModelContext.Provider>
}

function CubeModelView() {
  const { cube } = useContext(CubeViewModelContext);
  const { pathname } = useLocation()

  return <>
    <div className='header'>
      <div className="row baseline wrap">
        <h2>{cube.name}</h2>
        <em>
          — a {cube.cards?.length ?? cube.print_ids?.length ?? cube.oracle_ids.length} card cube
          from{" "}
          {cube.source !== "list" && <a href={cubeLink(cube)}
             rel='noreferrer'
             target='_blank'>
            {CUBE_SOURCE_TO_LABEL[cube.source]}
          </a>}
          {cube.source === "list" && "a text list"}
        </em>
      </div>
      <div className="cube-subroutes row">
        <Link to={`/cube/${cube.key}`} className={pathname === `/cube/${cube.key}` ? "active-link" : ""}>overview</Link>
        <Link to={`/cube/${cube.key}/list`} className={pathname === `/cube/${cube.key}/list` ? "active-link" : ""}>list</Link>
        <div>
          {cube.source !== "list" && <>
            <CopyToClipboardButton
              copyText={`${window.location.protocol}//${window.location.host}/data/cube/${cube.key}?source=${cube.source}`}
              title={`copy share link to keyboard`}
              buttonText={shareButtonText}
            />
            <RefreshButton toSubmit={[cube]} />
          </>}
          {" "}
          <strong>last updated:</strong> {cube.last_updated?.toLocaleString() ?? "~"}
        </div>
      </div>
    </div>
    <Routes>
      <Route path="/list" element={<CubeList />}/>
      <Route path="" element={<CubeOverview />}/>
    </Routes>
  </>
}
