import { _CardImage } from '../card/CardLink'
import React, { useState } from 'react'
import { useViewportListener } from '../viewport'
import { useLiveQuery } from 'dexie-react-hooks'
import { parseEntry } from '../../api/local/types/cardEntry'
import { cogDB } from '../../api/local/db'

const CARD_RATIO = 2.5/3.5;
const MAX_CARD_HEIGHT = 350;

export function useHoverCard() {
  const [mouseLast, setMouseLast] = useState({ x:0, y:0 });
  const handleHover = (e: React.MouseEvent<HTMLDivElement>) => {
    setMouseLast({ x: e.clientX, y: e.clientY });
  }

  return {
    mouseLast, handleHover,
  }
}

interface HoverCardProps {
  cursorDistance?: number
  cardName?: string
  mouseLast: { x: number; y: number }
}
export function HoverCard({ cursorDistance = 5, cardName, mouseLast }: HoverCardProps) {
  const viewport = useViewportListener();
  const cardHeight = Math.min(viewport.height / 2, MAX_CARD_HEIGHT);
  const cardWidth = cardHeight * CARD_RATIO;
  const card = useLiveQuery(async () => {
    if (cardName === undefined) return undefined;
    const { name, set, cn } = parseEntry(cardName);
    return cogDB.getCardByName(name, set, cn);
  }, [cardName]);

  return <div style={{
    position: 'fixed',
    zIndex: 9999,
    pointerEvents: 'none',
    top: mouseLast.y < viewport.height / 2
      ? mouseLast.y + cursorDistance
      : mouseLast.y - cursorDistance - cardHeight,
    left: mouseLast.x < viewport.width / 2
      ? mouseLast.x + cursorDistance
      : mouseLast.x - cursorDistance - cardWidth,
    width: cardWidth, height: cardHeight,
  }}>
    <_CardImage card={card} nameFallback={false} />
  </div>
}