import React from 'react'
import { useParams } from 'react-router'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../../api/local/db'
import { CardImageView } from '../../cardBrowser/cardViews/cardImageView'
import { Card, SortFunctions } from 'mtgql'
import { PageControl, usePageControl } from '../../cardBrowser/pageControl'
import _sortBy from 'lodash/sortBy'
import { SearchHoverActions } from '../../cardBrowser/cardViews/searchHoverActions'
import { LoaderText, TRIANGLES } from '../../component/loaders'

export interface OtagViewProps {

}

const pageSize = 60;
export function OtagView({}: OtagViewProps) {
  const { tag } = useParams();
  const {
    pageNumber, setPageNumber,
    lowerBound, upperBound
  } = usePageControl(pageSize);
  const tagInfo = useLiveQuery(async () => cogDB.oracleTag.get({ label: tag }), [tag])
  const cards = useLiveQuery(async () => {
    if (!tagInfo) return null;
    const cards: Card[] = (await cogDB.card.bulkGet(tagInfo.oracle_ids)).map(it => ({
      ...it,
      ...it.printings[0],
    }));

    return _sortBy(cards, ["cmc", SortFunctions.byColor, SortFunctions.byName]);
  }, [tagInfo]);
  const page = cards?.slice(lowerBound, upperBound) ?? null;

  return <>
    <h2>{tag} ({tagInfo?.oracle_ids.length ?? <LoaderText text="" frames={TRIANGLES} />})</h2>
    {tagInfo?.description && <p>{tagInfo.description}</p>}

    <PageControl
      pageNumber={pageNumber} setPageNumber={setPageNumber}
      upperBound={upperBound} pageSize={pageSize}
      count={cards?.length ?? 0}
    />
    <div className='result-container'>
      {page?.map(card => <CardImageView
        key={card.id}
        card={{data:card, weight: 0, matchedQueries:[]}}
        hoverContent={<SearchHoverActions card={{data:card, weight: 0, matchedQueries:[]}} />}
      />)}
    </div>
  </>
}