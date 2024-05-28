import React, { useContext, useState } from 'react'
import { DOUBLE_FACED_LAYOUTS, Card, ImageUris } from 'mtgql'
import "./cardImage.css"
import { FlagContext } from '../../flags'

const getBackImageURI = (card: Card, version: keyof ImageUris) => {
  return card.card_faces.length === 1
    ? ''
    : card.card_faces[1]?.image_uris[version] ?? ''
}

function getFrontImageURI(card: Card, version: keyof ImageUris): string | undefined {
  if (!card.card_faces) return undefined;
  return card.card_faces[0]?.image_uris?.[version]
    ?? card.image_uris?.[version];
}

interface CardImageProps {
  card: Card
}

export const CardImage = ({ card }: CardImageProps) => {
  const { edhrecOverlay } = useContext(FlagContext).flags
  const [flipped, setFlipped] = useState(false)
  const onFlipCLick = e => {
    e.stopPropagation()
    setFlipped((prev) => !prev)
  }
  const version = 'normal'
  const imageSource = flipped
    ? getBackImageURI(card, version)
    : card.image_uris?.normal ?? getFrontImageURI(card, version)
  return <div className={`card-image ${card.set}`}>
    <img
      width='100%'
      src={imageSource}
      alt={card.name}
      title={card.name}
      onError={() => {
        // load local backup
      }}
    />
    {DOUBLE_FACED_LAYOUTS.includes(card.layout) && (
      <button
        className='flip-button'
        onClick={onFlipCLick}
        title='flip'
      >🔄</button>
    )}
    {edhrecOverlay&&<div className='edhrec-lol'>{card.edhrec_rank}</div>}
  </div>
}