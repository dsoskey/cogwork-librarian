import { EnrichedCard, SCORE_PRECISION } from '../../../api/queryRunnerCommon'
import React, { useContext } from 'react'
import './cardListView.css'
import { FlagContext } from '../../flags'
import { ManaCost } from '../../card/manaCost'
import { CardLink } from '../../card/CardLink'


interface CardListRowProps {
  card: EnrichedCard
}


export function CardListRow({ card }: CardListRowProps) {
  const { showDebugInfo } = useContext(FlagContext).flags

  return <tr>
    <td>
      <CardLink name={card.data.name} id={card.data.id} />
    </td>
    <td className='mana-cost'>
      {card.data.mana_cost ? <ManaCost manaCost={card.data.mana_cost} /> : '~'}
    </td>
    <td>{card.data.type_line}</td>
    {showDebugInfo && <td>{card.weight.toPrecision(SCORE_PRECISION)}</td>}
  </tr>
}

interface CardListViewProps {
  result: EnrichedCard[]
}

// NEXT: column config to combine with data viz functions
export function CardListView({ result }: CardListViewProps) {
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