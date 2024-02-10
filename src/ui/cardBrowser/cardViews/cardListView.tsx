import { EnrichedCard, SCORE_PRECISION } from '../../../api/queryRunnerCommon'
import React, { useContext } from 'react'
import './cardListView.css'
import { FlagContext } from '../../flags'
import { ManaCost } from '../../card/manaCost'


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