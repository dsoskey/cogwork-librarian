import React, { useState } from 'react'
import { useHoverCard } from '../hooks/useHoverCard'

export interface HoverableProps {
  children: React.ReactNode;
  hoverElement: React.ReactNode;
}

/**
 * future improvements
 *  - tab over
 *  - control placement
 *  - refactor useHoverCard to be more generic
 */
export function Hoverable({ children, hoverElement }: HoverableProps) {
  const { isOver, hoverStyle, ...listeners } = useHoverable();

    return <>
      <span {...listeners}>{children}</span>
      {isOver && <span style={hoverStyle}>{hoverElement}</span>}
    </>;
}

function useHoverable() {

  const [isOver, setIsOver] = useState(false);
  const onMouseEnter = () => {
    setIsOver(true);
  }

  const onMouseLeave = () => {
    setIsOver(false);
  }
  const { handleHover, hoverStyle } = useHoverCard();

  return {
    isOver,
    hoverStyle,
    onMouseEnter,
    onMouseLeave,
    onMouseMove: handleHover,
  }
}