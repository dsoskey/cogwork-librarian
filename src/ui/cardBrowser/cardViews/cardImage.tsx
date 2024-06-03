import React, { useContext, useState } from 'react'
import { Card, DOUBLE_FACED_LAYOUTS, ImageUris } from 'mtgql'
import { FlagContext } from '../../flags'
import "./cardImage.css"

const getBackImageURI = (card: Card, version: keyof ImageUris) => {
  return card.card_faces.length === 1
    ? ''
    : card.card_faces[1]?.image_uris?.[version] ?? ''
}

function getFrontImageURI(card: Card, version: keyof ImageUris): string | undefined {
  if (!card.card_faces) return undefined;
  return card.card_faces[0]?.image_uris?.[version]
    ?? card.image_uris?.[version];
}

interface CardImageProps {
  card: Card
  altImageUri?: string
  altImageBackUri?: string
}

export const CardImage = ({ card, altImageUri, altImageBackUri }: CardImageProps) => {
  const { edhrecOverlay } = useContext(FlagContext).flags;
  const [transformed, setTransformed] = useState(false);
  const [flipped, setFlipped] = useState(false);
  const canTransform = DOUBLE_FACED_LAYOUTS.includes(card.layout)

  const onTransformCLick = e => {
    e.stopPropagation()
    setTransformed((prev) => !prev)
  }
  const onFlipClick = e => {
    e.stopPropagation();
    setFlipped(prev => !prev)
  }
  const version = 'normal'
  return <div className={`card-image ${card.set}`}>
    <img
      className={`front ${flipped ? "flipped" : ""} ${canTransform && transformed ? "transformed" : ""}`}
      width='100%'
      src={altImageUri ?? card.image_uris?.normal ?? getFrontImageURI(card, version)}
      alt={card.name}
      title={card.name}
      loading={"lazy"}
      onError={() => {
        // load local backup
      }}
    />
    {canTransform &&
      <img
        className={`back ${canTransform && transformed ? "transformed" : ""}`}
        width='100%'
        src={altImageBackUri ?? getBackImageURI(card, version)}
        alt={card.name}
        title={card.name}
        loading={"lazy"}
        onError={() => {
          // load local backup
        }}
      />
    }
    {canTransform && (
      <button
        className='transform-button'
        onClick={onTransformCLick}
        title='transform'
      >🔄</button>
    )}
    {card.layout === "flip" && (
      <button
        className="flip-button"
        onClick={onFlipClick}
        title="flip"
      >🔄</button>
    )}
    {edhrecOverlay&&<div className='edhrec-lol'>{card.edhrec_rank}</div>}
  </div>
}