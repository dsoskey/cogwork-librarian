import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CardImageView } from './cardViews/cardImageView'
import { PAGE_SIZE } from './constants'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { EnrichedCard, RunStrategy } from '../../api/queryRunnerCommon'
import { DataSource, TaskStatus } from '../../types'
import { QueryReport } from '../../api/useReporter'
import { PageControl, PageInfo, usePageControl } from './pageControl'
import { useViewportListener } from '../hooks/useViewportListener'
import { TopBar } from './topBar'
import { ActiveCollection, CardDisplayInfo, DisplayType } from './types'
import { useDebugDetails } from './useDebugDetails'
import { CogError } from '../../error'
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { CardJsonView } from './cardViews/cardJsonView'
import { CardListView } from './cardViews/cardListView'
import { DISMISS_TIMEOUT_MS, ToasterContext } from '../component/toaster'
import { useVennControl, VennControl } from './vennControl'
import { Card } from 'mtgql'
import { SearchHoverActions } from './cardViews/searchHoverActions'
import { CardsPerRowControl } from '../component/cardsPerRowControl'
import { CardVizView } from './cardViews/cardVizView'
import { Layout } from 'mtgql/build/generated/models/Layout'
import { useHighlightFilter } from './useHighlightFilter'
import { FlagContext } from '../flags'
import { DisplayTypesControl } from './displayTypesControl'
import { HighlightFilterControl } from './highlightFilterControl'
import { Link } from 'react-router-dom'
import { ExportWidget } from '../component/exportWidget'

const ROTATED_LAYOUTS = new Set<Layout>(['split', 'planar', 'art_series'])

interface BrowserViewProps {
  lastQueries: string[]
  status: TaskStatus
  result: Array<EnrichedCard>
  runStrategy: RunStrategy
  report: QueryReport
  source: DataSource
  addCards: (query: string, card: Card[]) => void
  addIgnoredId: (id: string) => void
  ignoredIds: string[]
  errors: CogError[]
}

export const BrowserView = React.memo(({
  addCards,
  addIgnoredId,
  ignoredIds,
  runStrategy,
  result,
  status,
  source,
  report,
  errors,
  lastQueries,
}: BrowserViewProps) => {
  const { displayTypes } = useContext(FlagContext).flags
  const viewport = useViewportListener()
  const [activeCollection, setActiveCollection] = useState<ActiveCollection>('search')
  const vc = useVennControl()
  const [displayType, setDisplayType] = useLocalStorage<DisplayType>('display-type', 'cards')
  const topOfResults = useRef<HTMLDivElement>()

  const [filterQuery, setFilterQuery] = useState<string>('')
  const { highlightFilter, error: highlightError } = useHighlightFilter(filterQuery, lastQueries)

  const cards: CardDisplayInfo = useMemo(() => {
    const ignoredIdSet = new Set(ignoredIds)
    const displayInfo: CardDisplayInfo = { bothCount: 0, ignore: [], leftCount: 0, rightCount: 0, search: [] }
    for (const card of result) {
      displayInfo.bothCount += card.both ? 1 : 0
      displayInfo.leftCount += card.left ? 1 : 0
      displayInfo.rightCount += card.right ? 1 : 0
      const ignored = ignoredIdSet.has(card.data.oracle_id)
      if (runStrategy === RunStrategy.Venn ? !ignored && vc.activeSections.find(sec => card[sec]) : !ignored) {
        displayInfo.search.push(card)
      } else if (ignored) {
        displayInfo.ignore.push(card)
      }
    }
    return displayInfo
  }, [result, ignoredIds, vc.activeSections])
  const activeCards = useMemo(
    () => cards[activeCollection],
    [activeCollection, cards]
  )

  const {
    visibleDetails,
    setVisibleDetails,
    revealDetails,
    setRevealDetails
  } = useDebugDetails()

  const [pageSize] = useLocalStorage('page-size', PAGE_SIZE)
  const [cardsPerRow, setCardsPerRow] = useLocalStorage('cards-per-row', 4)
  const { pageNumber, setPageNumber, lowerBound, upperBound } = usePageControl(pageSize, 0)
  const setPage = (n: number) => {
    setPageNumber(n)
    setTimeout(() => {
      topOfResults.current?.scrollIntoView({
        block: 'start',
        inline: 'nearest',
        behavior: 'smooth'
      })
    }, 100)
  }
  useEffect(() => {
    setPage(0)
  }, [result, vc.activeSections])
  const currentPage = useMemo(
    () => activeCards.slice(lowerBound, upperBound),
    [activeCards, lowerBound, upperBound]
  )
  const showCards = activeCards.length > 0 && status !== 'error'
  const rotateCards = useMemo(() =>
    currentPage
      .filter(it => (ROTATED_LAYOUTS.has(it.data.layout) || it.data.type_line?.includes('Battle')) && !it.data.keywords.includes('Aftermath'))
      .length === currentPage.length, [currentPage])

  useHighlightPrism([result, revealDetails, visibleDetails])

  if (status === 'unstarted' && errors.length === 0) {
    return null
  }

  const pageControl = showCards ? <div className='row center wrap justify-end'>
    <PageInfo
      searchCount={cards.search.length}
      ignoreCount={cards.ignore.length}
      lowerBound={lowerBound + 1}
      upperBound={upperBound}
    />
    <PageControl
      pageNumber={pageNumber}
      setPageNumber={setPage}
      pageSize={pageSize}
      upperBound={upperBound}
      count={activeCards.length}
    />
  </div> : null

  const isCardDisplay = (displayType === 'cards' || displayType === 'render')

  const displayTypesControl = displayTypes ?
    <DisplayTypesControl
      displayType={displayType}
      setDisplayType={setDisplayType}
      activeCollection={activeCollection}
      setActiveCollection={setActiveCollection}
    /> : null

  const cardsPerRowControl = isCardDisplay && viewport.width > 1024
    ? <CardsPerRowControl cardsPerRow={cardsPerRow} setCardsPerRow={setCardsPerRow} disabled={rotateCards} />
    : undefined

  return <div className='results' ref={topOfResults}>
    <div className='content'>
      <TopBar
        highlightFilterControl={<HighlightFilterControl
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
          highlightError={highlightError}
        />}
        displayTypesControl={displayTypesControl}
        lastQueries={lastQueries}
        pageControl={pageControl}
        downloadButton={<ExportWidget addCards={addCards} lastQueries={lastQueries} searchResult={activeCards}  />}
        vennControl={runStrategy === RunStrategy.Venn
          ? <VennControl {...vc} cards={cards} />
          : null}
        cardsPerRowControl={cardsPerRowControl}
        errors={errors}
        source={source}
        status={status}
        report={report}
        visibleDetails={visibleDetails}
        setVisibleDetails={setVisibleDetails}
        revealDetails={revealDetails}
        setRevealDetails={setRevealDetails}
      />

      {result.length === 0 && status === "success" && <div className='none-cards'>
        <div className="bold">No cards found</div>
        <p>Check your query or head over to <Link to='./user-guide/query-syntax'>the syntax guide</Link></p>
      </div>}
      {showCards && result.length > 0 && <>
        <CardResults
          lastQueries={lastQueries}
          isCardDisplay={isCardDisplay}
          rotateCards={rotateCards}
          displayType={displayType}
          currentPage={currentPage}
          result={result}
          addCards={addCards}
          addIgnoredId={addIgnoredId}
          cardsPerRow={cardsPerRow}
          revealDetails={revealDetails}
          visibleDetails={visibleDetails}
          highlightFilter={highlightFilter} />
        {viewport.mobile && <div className='bottom-page-control'>
          {pageControl}
        </div>}
      </>}
    </div>
  </div>
})

interface CardResultsProps {
  lastQueries: string[];
  isCardDisplay: boolean;
  rotateCards: boolean;
  displayType: DisplayType;
  currentPage: EnrichedCard[];
  result: EnrichedCard[];
  addCards: (query: string, card: Card[]) => void
  addIgnoredId: (id: string) => void
  cardsPerRow: number;
  revealDetails: boolean
  visibleDetails: string[]
  highlightFilter: (card: Card) => boolean
}

function CardResults({
  lastQueries,
  currentPage,
  result,
  addCards,
  addIgnoredId,
  rotateCards,
  isCardDisplay,
  cardsPerRow,
  displayType,
  revealDetails,
  visibleDetails,
  highlightFilter,
}: CardResultsProps) {

  const { addMessage, dismissMessage } = useContext(ToasterContext)


  return <div className='result-container'>
    {isCardDisplay && currentPage.map((card, index) => {
      const onAdd = () => {
        addCards(lastQueries.join("\n"), [card.data])
        const id = addMessage(`Added ${card.data.name} to saved cards`, false)
        setTimeout(() => {
          dismissMessage(id)
        }, DISMISS_TIMEOUT_MS)
      }
      const onIgnore = () => {
        addIgnoredId(card.data.oracle_id)
        const id = addMessage(`Ignored ${card.data.name} from future searches`, false)
        setTimeout(() => {
          dismissMessage(id)
        }, DISMISS_TIMEOUT_MS)
      }
      return (
        <CardImageView
          className={`card-grid _${cardsPerRow}${rotateCards ? ' rotated' : ''}`}
          onAdd={onAdd}
          hoverContent={<SearchHoverActions card={card} onAdd={onAdd} onIgnore={onIgnore} />}
          key={card.data.id + index}
          card={card}
          showRender={displayType === 'render'}
          revealDetails={revealDetails}
          visibleDetails={visibleDetails}
          highlightFilter={highlightFilter}
        />
      )
    })}
    {displayType === 'viz' && <div className='viz-container'>
      <CardVizView cards={result} />
      <CardListView result={currentPage} />
    </div>}
    {displayType === 'json' && <CardJsonView result={currentPage} />}
    {displayType === 'list' && <CardListView result={currentPage} />}
  </div>
}