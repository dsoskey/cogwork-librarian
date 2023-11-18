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
import { ActiveCollection, DisplayType } from './types'
import { useDebugDetails } from './useDebugDetails'
import { CogError } from '../../error'
import { useHighlightPrism } from '../../api/local/syntaxHighlighting'
import { CardJsonView } from './cardViews/cardJsonView'
import { CardListView } from './cardViews/cardListView'
import { DISMISS_TIMEOUT_MS, ToasterContext } from '../component/toaster'

interface BrowserViewProps {
  status: TaskStatus
  result: Array<EnrichedCard>
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
  result,
  status,
  source,
  report,
  errors,
}: BrowserViewProps) => {
  const { addMessage, dismissMessage } = useContext(ToasterContext)
  const viewport = useViewportListener()
  const [activeCollection, setActiveCollection] = useState<ActiveCollection>('search')
  const [displayType, setDisplayType] = useLocalStorage<DisplayType>('display-type', 'cards')
  const topOfResults = useRef<HTMLDivElement>()

  const cards: Record<ActiveCollection, EnrichedCard[]> = useMemo(() => {
    const ignoredIdSet = new Set(ignoredIds)
    return {
      search: result.filter((it) => !ignoredIdSet.has(it.data.oracle_id)),
      ignore: result.filter((it) => ignoredIdSet.has(it.data.oracle_id)),
    }
  }, [result, ignoredIds])
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
  }, [result])
  const currentPage = useMemo(
    () => activeCards.slice(lowerBound - 1, upperBound),
    [activeCards, lowerBound, upperBound]
  )
  const showCards = activeCards.length > 0 && status !== 'error'

  useHighlightPrism([result, revealDetails, visibleDetails])

  if (status === 'unstarted' && errors.length === 0) {
    return null
  }

  const pageControl = showCards ? <PageControl
    page={page}
    setPage={setPage}
    pageSize={pageSize}
    upperBound={upperBound}
    cardCount={activeCards.length}
  /> : null


  const downloadButton = <div><button onClick={() => {
    const blob = new Blob([JSON.stringify(result)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob)
    const now = new Date()

    const link = document.createElement("a")
    link.href = url;
    link.download = `coglib-results-${now.toISOString().replace(/:/g, "-")}.json`
    document.body.append(link);
    link.click();

    URL.revokeObjectURL(url)
    link.remove()
  }}>download json</button></div>

  return <div className='results' ref={topOfResults}>
      <div className='column content'>
        <TopBar
          pageControl={pageControl}
          downloadButton={downloadButton}
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
            {(displayType === 'cards' || displayType === 'render') && currentPage.map((card) => (
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
                key={card.data.id}
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
