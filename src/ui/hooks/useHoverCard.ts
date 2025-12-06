import React, { useState } from 'react'
import { useViewportListener } from './useViewportListener'

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

  const hoverStyle: React.CSSProperties = {
    position: 'fixed',
    zIndex: 9999,
    pointerEvents: 'none',
    top: mouseLast.y < viewport.height / 2
      ? mouseLast.y + cursorDistance
      : undefined,
    bottom: mouseLast.y >= viewport.height / 2
      ? viewport.height - mouseLast.y + cursorDistance
      : undefined,
    left: mouseLast.x < viewport.width / 2
      ? mouseLast.x + cursorDistance
      : undefined,
    right: mouseLast.x >= viewport.width / 2
      ? viewport.width - mouseLast.x - cursorDistance
      : undefined,
  }

  return { mouseLast, handleHover, hoverStyle }
}