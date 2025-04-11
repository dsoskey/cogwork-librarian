import React, { useContext } from 'react'
import { Link } from 'react-router-dom'
import { cogDB as cogDBClient } from '../../api/local/db'
import { CardImageView } from '../cardBrowser/cardViews/cardImageView'
import './cubeView.css'
import { CUBE_SOURCE_TO_LABEL, cubeLink } from '../component/cube/sourceIcon'
import { Modal } from '../component/modal'
import { RefreshButton } from '../component/cube/refreshButton'
import { ScryfallIcon } from '../icons/scryfallIcon'
import { LoaderText } from '../component/loaders'
import { LINK_BUTTON_ICONS, CopyToClipboardButton } from '../component/copyToClipboardButton'
import { CubeNotFoundView } from './notFoundView'
import {
  CubeViewModelContext,
  useCubeViewModel
} from './useCubeViewModel'
import { Route, Routes, useLocation } from 'react-router'
import { CubeOverview } from './cubeOverview'
import { CubeList } from './cubeList'
import { FlagContext } from '../flags'
import { ManaCost } from '../card/manaCost'
import { CubeSearchTable } from './searchTable/cubeSearchTable'
import { COPY_TITLE } from '../cardBrowser/cardViews/searchHoverActions'
import { PrinterIcon } from '../icons/printer'
import { ComboListView } from './comboListView'


export function CubeView() {
  const showDebugInfo = useContext(FlagContext).flags.showDebugInfo;
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
           title="view on Scryfall "
        ><ScryfallIcon size="1.5em" /></a>
        {showDebugInfo && <CopyToClipboardButton
          copyText={() => JSON.stringify(activeCard, undefined, 2)}
          buttonText={LINK_BUTTON_ICONS}
          titleText={COPY_TITLE}
        />}
      </div>}
      onClose={() => setActiveCard(undefined)}>
      {activeCard && <div className="row active-card-root">
          <div>
            <CardImageView
              card={{ data: activeCard, matchedQueries: [`cube:${cube.key}`], weight: 1 }}
              altImageUri={activeCard.alt_image_uri}
              altImageBackUri={activeCard.alt_image_back_uri}
            />
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
          </div>
        <div>
          <div className='row baseline'>
            <h3>mana cost</h3>
            {activeCard.mana_cost && <ManaCost manaCost={activeCard.mana_cost} />}

            <h3>mana value</h3>
            <div>{activeCard.cmc?.toString()}</div>
          </div>

          <h3>colors</h3>
          <div className='row'>{activeCard.colors
            ?.map(it => <span key={it}>{it}</span>)}</div>

          {activeCard.color_category && <><h3>color category</h3>
            <div>{activeCard.color_category}</div>
          </>}

          <h3>type line</h3>
          <div>{activeCard.type_line}</div>

          <h3>rarity</h3>
          <div>{activeCard.rarity}</div>

          <h3>tags</h3>
          <div className='row'>{activeCard.tags
            ?.map(it => <span key={it}>{it}</span>)}</div>

          <h4>otags</h4>
          <div className='row wrap'>
            {cubeViewModel.otags && cubeViewModel.otags[activeCard.index]?.otags
              .map(it => <Link to={`/data/otag/${it}`} key={it}>{it}</Link>)}
          </div>

          <h4>atags</h4>
          <div className='row wrap'>
            {cubeViewModel.itags && cubeViewModel.itags[activeCard.index]?.itags
              // .map(it => <Link to={`/data/itag/${it}`} key={it}>{it}</Link>)}
              .map(it => <span key={it}>{it}</span>)}
          </div>

          <h3>notes</h3>
          <div>{activeCard.notes ?? '~'}</div>

          <h3>status</h3>
          <div>{activeCard.status}</div>
        </div>
      </div>}
    </Modal>
  </CubeViewModelContext.Provider>
}

function CubeModelView() {
  const { cube, cards } = useContext(CubeViewModelContext)
  const { cubeCombos } = useContext(FlagContext).flags;
  const { pathname } = useLocation()

  return <>
    <div className='header'>
      <div className="row baseline wrap">
        <h2>{cube.name}</h2>
        <em>
          — a {cube.cards?.length ?? cube.print_ids?.length ?? cube.oracle_ids.length} card cube
          {cube.created_by && ` created by ${cube.created_by} `}
          from{" "}
          {cube.source !== "list" && <a href={cubeLink(cube)}
             rel='noreferrer'
             target='_blank'>
            {CUBE_SOURCE_TO_LABEL[cube.source]}
          </a>}
          {cube.source === "list" && "a text list"}
        </em>
      </div>
      <div className='cube-subroutes row center'>
        <Link to={`/cube/${cube.key}`} className={pathname === `/cube/${cube.key}` ? 'active-link' : ''}>overview</Link>
        <Link to={`/cube/${cube.key}/list`}
              className={pathname === `/cube/${cube.key}/list` ? 'active-link' : ''}>list</Link>
        <Link to={`/cube/${cube.key}/table`} className={pathname === `/cube/${cube.key}/table` ? 'active-link' : ''}>search
          table</Link>
        {cubeCombos && <Link to={`/cube/${cube.key}/combos`} className={pathname === `/cube/${cube.key}/combos` ? 'active-link' : ''}>
          combos
        </Link>}
        <div>
          {cube.source !== 'list' && <>
            <CopyToClipboardButton
              copyText={`${window.location.protocol}//${window.location.host}/cube/${cube.key}?source=${cube.source}`}
              title={`copy share link to keyboard`}
              buttonText={LINK_BUTTON_ICONS}
              className="square"
            />
            <RefreshButton toSubmit={[cube]} />
          </>}
          <button
            disabled={pathname !== `/cube/${cube.key}/list`}
            className={pathname === `/cube/${cube.key}/list` ? '' : 'gone'}
            onClick={print}
            title='print cube proxies'><PrinterIcon />
          </button>
        </div>
        <div><span className='bold'>last updated:</span> {cube.last_updated?.toLocaleString() ?? '~'}</div>
      </div>
    </div>
    <Routes>
      <Route path='/list' element={<CubeList />} />
      <Route path='/table' element={<CubeSearchTable />} />
      {cubeCombos && <Route path='/combos' element={<ComboListView cards={cards} />} />}
      <Route path="" element={<CubeOverview />}/>
    </Routes>
  </>
}
