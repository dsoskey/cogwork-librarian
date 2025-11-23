import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'
import { Card, DOUBLE_FACED_LAYOUTS } from 'mtgql'
import { LoaderText, TRIANGLES } from '../component/loaders'
import { CardImage } from '../cardBrowser/cardViews/cardImage'
import "./cardLink.css"
import { imageUris } from '../../api/mtgjson'
import { InputProps } from '../component/input'
import { Autocomplete } from '../component/autocomplete'
import { useHoverCard } from '../hooks/hoverCard'

export function useCardLoader(name: string, id?: string) {
  return useLiveQuery(
    async () => cogDB.getCardByNameId(name, id),
    [name, id],
    null)
}

export function _CardImage({ card, name, nameFallback = true, showBothSides= false }) {
  return <span className="card-image-container">
    {card === null && <span><LoaderText text={""} timeout={100} frames={TRIANGLES} /></span>}
    {card === undefined && nameFallback && name}
    {card && <CardImage card={card} showBothSides={showBothSides} />}
  </span>
}
export function MDCardImage ({ name, id }) {
  const card: Card = useCardLoader(name, id);
  return <_CardImage card={card} name={name} />
}

interface CardNameLinkProps {
  name: string
  id?: string
}
export function CardNameLink({ name, id }: CardNameLinkProps) {
  const card: Card = useCardLoader(name, id);

  return <CardLink
    name={name}
    id={card?.id ?? id ?? ''}
    hasBack={card ? DOUBLE_FACED_LAYOUTS.includes(card.layout) : false}
  />;
}

interface CardLinkProps {
  name: string
  id: string
  imageSrc?: string;
  hasBack?: boolean;
  onClick?: () => void;
  lockable?: boolean;
}

export function CardLink({ lockable, onClick, imageSrc, name, id, hasBack }: CardLinkProps) {
  const _lockable = lockable ?? true;
  const [isLockedOpen, setIsLockedOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const handleMouseEnter = () => {
    setIsOpen(true);
  }

  const handleMouseLeave = () => {
    setIsOpen(false);
  }

  const { handleHover, getHoverStyle } = useHoverCard();

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleHover}
        className={`card-link ${isLockedOpen ? "active" : ''}`}
        title={isLockedOpen
          ? ""
          : (_lockable
            ? "click hovered text to keep image open"
            : name)
      }
        onClick={() => {
          if (_lockable) {
            setIsLockedOpen(p=>!p)
          }
          onClick?.()
        }}
      >
        {name}
      </span>
      {(isLockedOpen || isOpen) && (
        <div
          className="popup-container"
          style={getHoverStyle(hasBack ? 2 : 1)}
          onClick={() => setIsLockedOpen(false)}
        >
          <img
            className="card-link-image"
            src={imageSrc ?? imageUris(id, "front").normal}
            alt={name}
          />
          {hasBack && <img
            className="card-link-image"
            src={imageUris(id, "back").normal}
            alt={name}
          />}
        </div>
      )}
    </>
  );
}

export interface HoverableInputProps extends InputProps {
  getCompletions: (input: string) => Promise<string[]>
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

  const { handleHover, getHoverStyle } = useHoverCard();

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
          style={getHoverStyle(hasBack ? 2 : 1)}
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