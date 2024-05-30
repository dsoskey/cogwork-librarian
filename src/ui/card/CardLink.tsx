import React, { useState } from 'react'
import { flip, offset, useFloating, useHover, useInteractions } from '@floating-ui/react'
import { useLiveQuery } from 'dexie-react-hooks'
import { cogDB } from '../../api/local/db'
import { Card } from 'mtgql'
import { LoaderText, TRIANGLES } from '../component/loaders'
import { CardImage } from '../cardBrowser/cardViews/cardImage'
import "./cardLink.css"
export function useCardLoader(name: string, id: string) {
  return useLiveQuery(
    async () => cogDB.getCardByNameId(name, id),
    [name, id],
    null)
}

function _CardImage({ card, name }) {
  return <span className="card-image-container">
    {card === null && <span><LoaderText text={""} timeout={100} frames={TRIANGLES} /></span>}
    {card === undefined && name}
    {card && <CardImage card={card} />}
  </span>
}
export function MDCardImage ({ name, id }) {
  const card: Card = useCardLoader(name, id);
  return <_CardImage card={card} name={name} />
}

interface CardLinkProps {
  name: string
  id: string
}
export function CardLink({ name, id }: CardLinkProps) {
  const card: Card = useCardLoader(name, id);
  const [isLockedOpen, setIsLockedOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const {refs, floatingStyles, context} = useFloating({
    open: isOpen,
    placement: "bottom",
    onOpenChange: setIsOpen,
    middleware: [offset({ mainAxis: 4 }), flip()],
  });

  const hover = useHover(context);

  const {getReferenceProps, getFloatingProps} = useInteractions([hover,]);

  return (
    <>
      <span className={`card-link ${isLockedOpen ? "active" : ''}`} ref={refs.setReference} {...getReferenceProps()} onClick={() => setIsLockedOpen(p=>!p)}>
        {name}
      </span>
      {(isLockedOpen || isOpen) && (
        <div
          className="popup-container"
          ref={refs.setFloating}
          style={floatingStyles}
          {...getFloatingProps()}
          onClick={() => setIsLockedOpen(false)}
        >
          <_CardImage name={name} card={card} />
        </div>
      )}
    </>
  );
}