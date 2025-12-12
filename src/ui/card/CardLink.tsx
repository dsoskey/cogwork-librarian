import React, { useState } from 'react'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'
import { Card, DOUBLE_FACED_LAYOUTS } from 'mtgql'
import { LoaderText, TRIANGLES } from '../component/loaders'
import { CardImage } from '../cardBrowser/cardViews/cardImage'
import "./cardLink.css"
import { imageUris } from '../../api/mtgjson'
import { useHoverCard } from '../hooks/useHoverCard'

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
  set?: string
  imageSrc?: string;
  hasBack?: boolean;
  onClick?: () => void;
  lockable?: boolean;
}

export function CardLink({ set, lockable = false, onClick, imageSrc, name, id, hasBack }: CardLinkProps) {
  const [isLockedOpen, setIsLockedOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const handleMouseEnter = () => {
    setIsOpen(true);
  }

  const handleMouseLeave = () => {
    setIsOpen(false);
  }

  const { handleHover, hoverStyle } = useHoverCard();

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseMove={handleHover}
        className={`card-link ${onClick ? 'clickable' : ''} ${isLockedOpen ? "active" : ''}`}
        title={isLockedOpen
          ? ""
          : (lockable
            ? "click hovered text to keep image open"
            : name)
      }
        onClick={() => {
          if (lockable) {
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
          style={hoverStyle}
          onClick={() => setIsLockedOpen(false)}
        >
          <img
            width={250}
            className={`card-image ${set??''}`}
            src={imageSrc ?? imageUris(id, "front").normal}
            alt={name}
          />
          {hasBack && <img
            width={250}
            className={`card-image ${set??''}`}
            src={imageUris(id, "back").normal}
            alt={name}
          />}
        </div>
      )}
    </>
  );
}
