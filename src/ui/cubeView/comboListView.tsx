import React, { useEffect } from 'react'
import { TaskStatus } from '../../types'
import { LoaderText } from '../component/loaders'
import { OrderedCard } from './useCubeViewModel'
import { PaginatedFindMyCombosResponseList, Variant } from '@space-cow-media/spellbook-client'
import { CardLink } from '../card/CardLink'
import "./comboListView.css"

export interface ListComboViewProps {
  cards: OrderedCard[]
}

export function ComboListView({cards}: ListComboViewProps) {
  const { comboInfo, comboInfoStatus, loadingError} = useComboLoader(cards);

  let content
  switch (comboInfoStatus) {
    case 'success':
      if (comboInfo.length === 0) return <div>No combos found.</div>

      content = comboInfo.map(variant =>
        <ComboVariant key={variant.id} variant={variant} />
      )
      break;
    case 'unstarted':
      content = null
      break;
    case 'loading':
      content = <LoaderText text='Loading combos' />
      break;
    case 'error':
      content = <div className='alert'>
        <h2>error loading combos:</h2>
        <pre><code>{loadingError}</code></pre>
      </div>
      break;
  }

  return <div className="combo-list-root">{content}</div>
}


export interface ComboVariantProps {
  variant: Variant;
}

export function ComboVariant({ variant }: ComboVariantProps) {
  return <div className='combo-variant-root'>
    <h3>cards needed</h3>
    <ul>
      {variant.uses.map(it => <li key={it.card.id}>
        {it.quantity > 1 ? `${it.quantity} ` : ''}
        <CardLink name={it.card.name} id={it.card.oracleId} />
      </li>)}
    </ul>
    <h3>combo result</h3>
    <ul>
      {variant.produces.map(it =>
        <li key={it.feature.id}>
          {it.quantity > 1 ? `${it.quantity} ` : ''}
          {it.feature.name}
        </li>
      )}
    </ul>

  </div>
}

export function useComboLoader(cards: OrderedCard[]) {
  const [comboInfo, setComboInfo] = React.useState<Variant[]>([])
  const [comboInfoStatus, setComboInfoStatus] = React.useState<TaskStatus>('unstarted')
  const [loadingError, setLoadingError] = React.useState<string>('')
  useEffect(() => {
    if (cards.length === 0) {
      setComboInfoStatus('unstarted')
      return
    }

    setComboInfoStatus("loading");
    setLoadingError("")
    fetch(
      "https://backend.commanderspellbook.com/find-my-combos",
      {
        method: 'POST',
        body: cards
          .map(it => it.name)
          .join("\n"),
      }
    )
      .then(r => r.json())
      .then((newComboInfo: PaginatedFindMyCombosResponseList) => {
        setComboInfoStatus("success");
        setLoadingError("");
        setComboInfo(newComboInfo.results.included)
    })
      .catch(error => {
        setComboInfoStatus("error");
        setLoadingError(error.toString());
      })
  }, [cards])

  return {
    comboInfo, comboInfoStatus, loadingError,
  }
}

