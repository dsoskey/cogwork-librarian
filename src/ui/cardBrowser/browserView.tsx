import React, { useContext, useEffect, useMemo, useRef, useState } from 'react'
import { CardImageView } from './cardViews/cardImageView'
import { PAGE_SIZE } from './constants'
import { useLocalStorage } from '../../api/local/useLocalStorage'
import { EnrichedCard } from '../../api/queryRunnerCommon'
import { DataSource, TaskStatus } from '../../types'
import { QueryReport } from '../../api/useReporter'
import { PageControl } from './pageControl'
import { useViewportListener } from '../../viewport'
import { TopBar } from './topBar'
import { ActiveCollection, CardDisplayInfo, DisplayType } from './types'
import { useDebugDetails } from './useDebugDetails'
import { CogError } from '../../error'
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { CardJsonView } from './cardViews/cardJsonView'
import { CardListView } from './cardViews/cardListView'
import { DISMISS_TIMEOUT_MS, ToasterContext } from '../component/toaster'
import { RunStrategy } from '../../api/scryfallExtendedParser'
import { useVennControl, VennControl } from './vennControl'

const typeToExt = {
  "application/json": "json",
  "text/plain": "txt",
}

const handleDownload = (text: string, type: string) => {
  const blob = new Blob([text], { type });
  const url = URL.createObjectURL(blob)
  const now = new Date()

  const link = document.createElement("a")
  link.href = url;
  link.download = `coglib-results-${now.toISOString().replace(/:/g, "-")}.${typeToExt[type]??"txt"}`
  document.body.append(link);
  link.click();

  URL.revokeObjectURL(url)
  link.remove()
}

interface BrowserViewProps {
  status: TaskStatus
  result: Array<EnrichedCard>
  runStrategy: RunStrategy
  report: QueryReport
  source: DataSource
  addCard: (name: string) => void
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
  const [cardsPerRow] = useLocalStorage('cards-per-row', 4)
  const [page, _setPage] = useState(0)
  const setPage = (n: number) => {
    _setPage(n)
    setTimeout(() => {
      topOfResults.current?.scrollIntoView({
        block: "start",
        inline: "nearest",
        behavior: "smooth"
      })
    }, 100)
  }
  const lowerBound = page * pageSize + 1
  const upperBound = (page + 1) * pageSize
  useEffect(() => {
    setPage(0)
  }, [result, vc.activeSections])
  const currentPage = useMemo(
    () => activeCards.slice(lowerBound - 1, upperBound),
    [activeCards, lowerBound, upperBound]
  )
  const showCards = activeCards.length > 0 && status !== 'error'

  useHighlightPrism([result, revealDetails, visibleDetails])

  if (status === 'unstarted' && errors.length === 0) {
    return null
  }

  const vennControl = runStrategy === RunStrategy.Venn ?
    <VennControl {...vc} cards={cards} />: null;

  const pageControl = showCards ? <PageControl
    page={page}
    setPage={setPage}
    pageSize={pageSize}
    upperBound={upperBound}
    cardCount={activeCards.length}
  /> : null

  const downloadButton = <div>
    <span>download:&nbsp;</span>
    <button onClick={() => handleDownload(result.map(it => it.data.name).join("\n"), 'text/plain')}>
      card names
    </button>
    <button onClick={() => handleDownload(JSON.stringify(result.map(it => it.data)), 'application/json')}>
      json
    </button>
  </div>

  return <div className='results' ref={topOfResults}>
      <div className='content'>
        <TopBar
          pageControl={pageControl}
          downloadButton={downloadButton}
          vennControl={vennControl}
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
          lowerBound={lowerBound}
          upperBound={upperBound}
          displayType={displayType}
          setDisplayType={setDisplayType}
          activeCollection={activeCollection}
          setActiveCollection={setActiveCollection}
        />

        {showCards && <>
          <div className='result-container'>
            {(displayType === 'cards' || displayType === 'render') && currentPage.map((card, index) => (
              <CardImageView
                className={`_${cardsPerRow}`}
                onAdd={() => {
                  addCard(card.data.name)
                  const id = addMessage(`Added ${card.data.name} to saved cards`, false)
                  setTimeout(() => {
                    dismissMessage(id)
                  }, DISMISS_TIMEOUT_MS)
                }}
                onIgnore={() => {
                  addIgnoredId(card.data.oracle_id)
                  const id = addMessage(`Ignored ${card.data.name} from future searches`, false)
                  setTimeout(() => {
                    dismissMessage(id)
                  }, DISMISS_TIMEOUT_MS)
                }}
                key={index}
                card={card}
                showRender={displayType === "render"}
                revealDetails={revealDetails}
                visibleDetails={visibleDetails}
              />
            ))}
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
