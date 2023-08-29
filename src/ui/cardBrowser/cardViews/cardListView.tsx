import { EnrichedCard, SCORE_PRECISION } from '../../../api/queryRunnerCommon'
import React, { useContext } from 'react'
import './cardListView.css'
import { ManaSymbol, toSplitCost } from '../../../api/memory/types/card'
import { ManaIcon } from '../../card/manaSymbol'
import { FlagContext } from '../../../flags'

interface CardListRowProps {
  card: EnrichedCard
}


export const CardListRow = ({ card }: CardListRowProps) => {
  const { showDebugInfo } = useContext(FlagContext).flags

  return <tr>
    <td>
      <a href={card.data.scryfall_uri} target='_blank' rel='noreferrer noopener'>
        {card.data.name}
      </a>
    </td>
    <td>
      {card.data.mana_cost && toSplitCost(card.data.mana_cost).map(it => <ManaIcon symbol={it as ManaSymbol} />)}
    </td>
    <td>{card.data.type_line}</td>
    {showDebugInfo && card.weight.toPrecision(SCORE_PRECISION)}
  </tr>
}

interface CardListViewProps {
  result: EnrichedCard[]
}

export const CardListView = ({ result }: CardListViewProps) => {
  const { showDebugInfo } = useContext(FlagContext).flags
  return <table className='list-view'>
    <thead>
      <tr>
        <th>name</th>
        <th>mana cost</th>
        <th>type</th>
        {showDebugInfo && <th>weight</th>}
      </tr>
    </thead>
    <tbody>
    {result.map(it => <CardListRow key={it.data.id} card={it} />)}
    </tbody>
  </table>
}