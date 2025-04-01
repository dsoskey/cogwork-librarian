import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CardImageView } from './cardViews/cardImageView'
import { PAGE_SIZE } from './constants'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { EnrichedCard, RunStrategy } from '../../api/queryRunnerCommon'
import { DataSource, TaskStatus } from '../../types'
import { QueryReport } from '../../api/useReporter'
import { PageControl, usePageControl } from './pageControl'
import { useViewportListener } from '../viewport'
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
import { downloadText } from '../download'
import { SearchHoverActions } from './cardViews/searchHoverActions'
import { CardsPerRowControl } from '../component/cardsPerRowControl'
import { CardVizView } from './cardViews/cardVizView'
import { Layout } from 'mtgql/build/generated/models/Layout'

const handleDownload = (text: string, ext: string) => {
  const now = new Date()
  const fileName = `coglib-results-${now.toISOString().replace(/:/g, "-")}`
  downloadText(text, fileName, ext)
}

const ROTATED_LAYOUTS = new Set<Layout>([
  'split',
  'planar',
  "art_series",
])

interface BrowserViewProps {
  status: TaskStatus
  result: Array<EnrichedCard>
  runStrategy: RunStrategy
  report: QueryReport
  source: DataSource
  addCard: (card: Card) => void
  addIgnoredId: (id: string) => void
  ignoredIds: string[]
  errors: CogError[]
}

export const BrowserView = React.memo(({
  addCard,
  addIgnoredId,
  ignoredIds,
  runStrategy,
  result,
  status,
  source,
  report,
  errors,
}: BrowserViewProps) => {
  const { addMessage, dismissMessage } = useContext(ToasterContext)
  const viewport = useViewportListener()
  const [activeCollection, setActiveCollection] = useState<ActiveCollection>('search')
  const vc = useVennControl()
  const [displayType, setDisplayType] = useLocalStorage<DisplayType>('display-type', 'cards')
  const topOfResults = useRef<HTMLDivElement>()

  const cards: CardDisplayInfo = useMemo(() => {
    const ignoredIdSet = new Set(ignoredIds)
    const displayInfo: CardDisplayInfo = { bothCount: 0, ignore: [], leftCount: 0, rightCount: 0, search: [] }
    for (const card of result) {
      displayInfo.bothCount += card.both ? 1:0
      displayInfo.leftCount += card.left ? 1:0
      displayInfo.rightCount += card.right ? 1:0
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
    setRevealDetails,
  } = useDebugDetails()

  const [pageSize] = useLocalStorage('page-size', PAGE_SIZE)
  const [cardsPerRow, setCardsPerRow] = useLocalStorage('cards-per-row', 4)
  const { pageNumber, setPageNumber, lowerBound, upperBound } = usePageControl(pageSize, 0);
  const setPage = (n: number) => {
    setPageNumber(n)
    setTimeout(() => {
      topOfResults.current?.scrollIntoView({
        block: "start",
        inline: "nearest",
        behavior: "smooth"
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
    .filter(it => (ROTATED_LAYOUTS.has(it.data.layout) || it.data.type_line?.includes("Battle")) && !it.data.keywords.includes("Aftermath"))
    .length === currentPage.length, [currentPage])

  useHighlightPrism([result, revealDetails, visibleDetails])

  if (status === 'unstarted' && errors.length === 0) {
    return null
  }

  const pageControl = showCards ? <PageControl
    pageNumber={pageNumber}
    setPageNumber={setPage}
    pageSize={pageSize}
    upperBound={upperBound}
    count={activeCards.length}
  /> : null

  const isCardDisplay = (displayType === 'cards' || displayType === 'render')

  const cardsPerRowControl = isCardDisplay && viewport.width > 1024
    ? <CardsPerRowControl cardsPerRow={cardsPerRow} setCardsPerRow={setCardsPerRow} disabled={rotateCards} />
    : undefined;

  return <div className='results' ref={topOfResults}>
      <div className='content'>
        <TopBar
          pageControl={pageControl}
          downloadButton={<DownloadButton searchResult={result} />}
          vennControl={runStrategy === RunStrategy.Venn
            ? <VennControl {...vc} cards={cards} />
            : null}
          cardsPerRowControl={cardsPerRowControl}
          errors={errors}
          source={source}
          status={status}
          report={report}
          searchCount={cards.search.length}
          ignoreCount={cards.ignore.length}
          visibleDetails={visibleDetails}
          setVisibleDetails={setVisibleDetails}
          revealDetails={revealDetails}
          setRevealDetails={setRevealDetails}
          lowerBound={lowerBound + 1}
          upperBound={upperBound}
          displayType={displayType}
          setDisplayType={setDisplayType}
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
        />

        {showCards && <>
          <div className='result-container'>
            {isCardDisplay && currentPage.map((card, index) => {
              const onAdd = () => {
                addCard(card.data)
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
                  className={`_${cardsPerRow}${rotateCards?" rotated":""}`}
                  onAdd={onAdd}
                  hoverContent={<SearchHoverActions card={card} onAdd={onAdd} onIgnore={onIgnore} />}
                  key={card.data.id + index}
                  card={card}
                  showRender={displayType === "render"}
                  revealDetails={revealDetails}
                  visibleDetails={visibleDetails}
                />
              )
            })}
            {displayType === "viz" && <div className="viz-container">
              <CardVizView cards={result} />
              <CardListView result={currentPage} />
            </div>}
            {displayType === 'json' && <CardJsonView result={currentPage} />}
            {displayType === 'list' && <CardListView result={currentPage} />}
          </div>
          {viewport.mobile && <div className='bottom-page-control'>
            {pageControl}
          </div>}
        </>}
      </div>
    </div>
})

export interface DownloadButtonProps {
  searchResult: Array<EnrichedCard>
}

export function DownloadButton({ searchResult }: DownloadButtonProps) {
  const [value, setValue] = useState<number>(NaN)
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Math.abs(parseInt(event.target.value)));
  }
  const sliceCount = value === 0 || isNaN(value) ? undefined : value;

  return <div className="download-button">
    <span className="bold">download <input
      type="number" pattern="[0-9]*"
      placeholder="all"
      value={isNaN(value) ? "":value}
      onChange={handleChange}
      onKeyDown={event => {
        if (event.key !== "Tab" && event.key !== "Backspace" && !/\d/.test(event.key)) {
          event.preventDefault()
        }
      }}
    />:&nbsp;</span>
    <button onClick={() => {
      handleDownload(
        searchResult.slice(0, sliceCount)
          .map(printName).join("\n"), 'txt')
    }}>
      card names
    </button>
    <button onClick={() => {
      handleDownload(JSON.stringify(
        searchResult.slice(0, sliceCount)
          .map(it => it.data)), 'json')
    }}>
      json
    </button>
  </div>
}

function printName(card: EnrichedCard) {
  if (card.data.layout === "split") return card.data.name
  return card.data.name.replace(/\/\/.*$/, "")
}