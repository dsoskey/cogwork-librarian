import { _CardImage } from '../card/CardLink'
import React, { useState } from 'react'
import { useViewportListener } from './useViewportListener'
import { useLiveQuery } from 'dexie-react-hooks'
import { parseEntry } from '../../api/local/types/cardEntry'
import { cogDB } from '../../api/local/db'
import { DOUBLE_FACED_LAYOUTS } from 'mtgql'

const CARD_RATIO = 2.5/3.5;
const MAX_CARD_HEIGHT = 350;
const CURSOR_DITANCE = 5
const HOVERCARD_DEFAULT_SETTINGS = {
  cursorDistance: CURSOR_DITANCE
};

export function useHoverCard({ cursorDistance } = HOVERCARD_DEFAULT_SETTINGS) {
  const viewport = useViewportListener()
  const [mouseLast, setMouseLast] = useState({ x:0, y:0 });
  const handleHover = (e: React.MouseEvent) => {
    setMouseLast({ x: e.clientX, y: e.clientY });
  }

  const cardHeight = Math.min(viewport.height / 2, MAX_CARD_HEIGHT);
  const cardWidth = cardHeight * CARD_RATIO;

  const getHoverStyle = (cardCount: number): React.CSSProperties => {
    const width = cardWidth * cardCount
    return {
      position: 'fixed',
        zIndex: 9999,
      pointerEvents: 'none',
      top: mouseLast.y < viewport.height / 2
      ? mouseLast.y + cursorDistance
      : mouseLast.y - cursorDistance - cardHeight,
      left: mouseLast.x < viewport.width / 2
      ? mouseLast.x + cursorDistance
      : mouseLast.x - cursorDistance - width,
      width,
      height: cardHeight,
    }
  }

  return { mouseLast, handleHover, getHoverStyle }
}

interface HoverCardProps {
  cardName?: string
  getHoverStyle: (cardCount: number) => React.CSSProperties
}
export function HoverCard({ cardName, getHoverStyle }: HoverCardProps) {
  const card = useLiveQuery(async () => {
    if (cardName === undefined) return undefined;
    const { name, set, cn } = parseEntry(cardName);
    return cogDB.getCardByName(name, set, cn);
  }, [cardName]);
  const canTransform = card ? DOUBLE_FACED_LAYOUTS.includes(card.layout): false;
  const style = getHoverStyle(canTransform ? 2 : 1)

  return <div style={style}>
    <_CardImage card={card} name={""} nameFallback={false} showBothSides />
  </div>
}