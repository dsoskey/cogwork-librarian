import { Autocomplete, AutocompleteProps } from '../autocomplete'
import { Card, DOUBLE_FACED_LAYOUTS } from 'mtgql'
import React, { useState } from 'react'
import { useHoverCard } from '../../hooks/useHoverCard'
import { imageUris } from '../../../api/mtgjson'
import { useCardLoader } from '../../card/CardLink'

export interface HoverableInputProps extends AutocompleteProps {
  setValue: (value: string) => void;
}

export function HoverableInput(props: HoverableInputProps) {
  const card: Card = useCardLoader(props.value);
  const hasBack = card ? DOUBLE_FACED_LAYOUTS.includes(card.layout) : false;
  const [isOpen, setIsOpen] = useState(false);
  const handleMouseEnter = () => {
    setIsOpen(true);
  }

  const handleMouseLeave = () => {
    setIsOpen(false);
  }

  const { handleHover, hoverStyle } = useHoverCard();

  return <>
    <Autocomplete
      {...props}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleHover}
    />
    {isOpen && card && (
      <div
        className="popup-container"
        style={hoverStyle}
      >
        <img
          className="card-link-image"
          src={imageUris(card.id, "front").normal}
          alt={card?.name}
        />
        {hasBack && <img
          className="card-link-image"
          src={imageUris(card.id, "back").normal}
          alt={card?.name}
        />}
      </div>
    )}
  </>;
}