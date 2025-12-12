import { _CardImage } from '../card/CardLink'
import React from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { parseEntry } from '../../api/local/types/cardEntry'
import { cogDB } from '../../api/local/db'
import { DOUBLE_FACED_LAYOUTS } from 'mtgql'

interface HoverCardProps {
  cardName?: string
  id?: string
  hoverStyle: React.CSSProperties
}
// todo: figure out how to show front and back without looking up card.
export function HoverCard({ cardName, id, hoverStyle }: HoverCardProps) {
  const card = useLiveQuery(async () => {
    if (!cardName && !id) return undefined;
    if (id) return cogDB.getCardByNameId(cardName, id)
    const { name, set, cn } = parseEntry(cardName);
    return cogDB.getCardByName(name, set, cn);
  }, [cardName]);
  const canTransform = card ? DOUBLE_FACED_LAYOUTS.includes(card.layout): false;

  return <div style={{ ...hoverStyle, width: canTransform ? 500 : 250 }}>
    <_CardImage card={card} name={""} nameFallback={false} showBothSides />
  </div>
}