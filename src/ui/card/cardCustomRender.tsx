import { Card, CardFace } from 'scryfall-sdk'
import React, { useMemo, useState } from 'react'
import { DOUBLE_FACED_LAYOUTS } from '../../api/memory/types/card'
import "./cardCustomRender.css"
import { ManaCost } from './manaCost'


function getColorClass(activeFace: Card | CardFace) {
  if (activeFace.colors === undefined || activeFace.colors.length === 0) {
    return activeFace.type_line.toLowerCase().includes("artifact") ? "brown": "c"
  }
  const colorsOnFace = activeFace.colors.filter(it =>
    activeFace.mana_cost?.includes(it) || activeFace.color_indicator?.includes(it)
  )
  if (colorsOnFace.length >= 3) {
    return "gold"
  }
  return colorsOnFace.sort().join("").toLowerCase()
}

interface CardCustomRenderProps {
  card: Card
  flipped?: boolean
}

const TopBar = ({ name, mana_cost }) =>
  <div className='top-box'>
    <span className='name'>{name}</span>
    {mana_cost && <span>{<ManaCost manaCost={mana_cost} />}</span>}
  </div>

const TypeBox = ({ type_line, set_name, set }) =>
  <div className='type-box'>
    <span className='type-line'>{type_line}</span>
    <span title={set_name}>{set}</span>
  </div>

const OracleText = ({ text }) => {
  const paragraphs = text.split("\n")

  return <div className='oracle'>
    {paragraphs.map((it, i) => <div key={i}>{it}</div>)}
  </div>
}


export const SplitCardRender = ({ card }: CardCustomRenderProps) => {
  const left = card.card_faces[0]
  const right = card.card_faces[1]

  return <div className='split-frame'>
    <div className={`split-left ${getColorClass(left)}`}>
      <TopBar name={left.name} mana_cost={left.mana_cost} />
      <img src={left.image_uris.art_crop} alt="" width="100%" />
      <TypeBox type_line={left.type_line} set_name={card.set_name} set={card.set} />
      <div className='text-box'>
        {left.oracle_text && <OracleText text={left.oracle_text}/>}
        {left.flavor_text && <div className='flavor'>{left.flavor_text}</div>}
      </div>
    </div>
    <div className={`split-right ${getColorClass(right)}`}>
      <TopBar name={right.name} mana_cost={right.mana_cost} />
      <img src={right.image_uris.art_crop} alt="" width="100%" />
      <TypeBox type_line={right.type_line} set_name={card.set_name} set={card.set} />
      <div className='text-box'>
        {right.oracle_text && <OracleText text={right.oracle_text}/>}
        {right.flavor_text && <div className='flavor'>{right.flavor_text}</div>}
      </div>
    </div>
  </div>
}

const AftermathCardRender = ({ card }: CardCustomRenderProps) => {
  const front = card.card_faces[0];
  const back = card.card_faces[1];
  return <>
    <div className={`aftermath-front frame ${getColorClass(front)}`}>
      <div className='top-box'>
        <span className='name'>{front.name}</span>
        {front.mana_cost && <span>{<ManaCost manaCost={front.mana_cost} />}</span>}
      </div>
      <img src={card.image_uris.art_crop} alt="" height="100%" width="100%" />
      <TypeBox type_line={front.type_line} set_name={card.set_name} set={card.set} />
      <div className='text-box'>
        {front.oracle_text && <OracleText text={front.oracle_text}/>}
        {front.flavor_text && <div className='flavor'>{front.flavor_text}</div>}
      </div>
    </div>
    <div className={`aftermath-back-placeholder frame ${getColorClass(back)}`}></div>

    <div className={`aftermath-back frame ${getColorClass(back)}`}>
      <div className='top-box'>
        <span className='name'>{back.name}</span>
        {back.mana_cost && <span className='mana'>{<ManaCost manaCost={back.mana_cost} />}</span>}
      </div>
      <img src={card.image_uris.art_crop} alt="" width="100%" />
      <TypeBox type_line={back.type_line} set_name="" set="" />
      <div className='aftermath-back-text-box'>
        {back.oracle_text && <OracleText text={back.oracle_text}/>}
        {back.flavor_text && <div className='flavor'>{back.flavor_text}</div>}
      </div>
    </div>
  </>
}

const FlipCardRender = ({ card }: CardCustomRenderProps) => {
  const colorClass = getColorClass(card)
  const statClass = `stat-box ${colorClass}`
  const top = card.card_faces[0];
  const bottom = card.card_faces[1];
  return <div className={`flip frame ${colorClass}`}>
    <div className="flip-top">
      <TopBar name={top.name} mana_cost={top.mana_cost} />
      <div className='text-box'>
        {top.oracle_text && <OracleText text={top.oracle_text}/>}
        {top.flavor_text && <div className='flavor'>{top.flavor_text}</div>}
      </div>
      <div className='type-box'>
        <span className='type-line'>{top.type_line}</span>
        {top.power && top.toughness && <div className={statClass}>{top.power} / {top.toughness}</div>}
      </div>
    </div>
    <img src={card.image_uris.art_crop} alt="" width="100%" />
    <div className='flip-bottom'>
      <TopBar name={bottom.name} mana_cost={bottom.mana_cost} />
      <div className='text-box'>
        {bottom.oracle_text && <OracleText text={bottom.oracle_text}/>}
        {bottom.flavor_text && <div className='flavor'>{bottom.flavor_text}</div>}
      </div>
      <div className='type-box'>
        <span className='type-line'>{bottom.type_line}</span>
        {bottom.power && bottom.toughness && <div className={statClass}>{bottom.power} / {bottom.toughness}</div>}
      </div>
    </div>
    <div className='flip-set'>{card.set}</div>
  </div>
}

const NormalCardRender = ({ card, flipped }: CardCustomRenderProps) => {
  const flipDex = flipped ? 1 : 0;
  const canFlip = DOUBLE_FACED_LAYOUTS.includes(card.layout)
  const activeFace = canFlip ? card.card_faces[flipDex] : card;
  const { name, mana_cost,
    type_line,
    oracle_text, flavor_text,
    loyalty, power, toughness, defense
  } = activeFace;
  const colorClass = useMemo(() => getColorClass(activeFace), [activeFace])
  const statClass = `stat-box ${colorClass}`

  return <div className={`normal frame ${colorClass}`}>
    <div className='top-box'>
      <span className='name'>{name}</span>
      {mana_cost && <span>{<ManaCost manaCost={mana_cost} />}</span>}
    </div>
    <div className='card-art'>
      <img src={activeFace.image_uris?.art_crop} alt="" height="100%" width="100%" />
    </div>
    <div className='type-box'>
      <span className='type-line'>{type_line}</span>
      <span title={card.set_name}>{card.set}</span>
    </div>
    <div className='text-box'>
      {oracle_text && <OracleText text={oracle_text}/>}
      {flavor_text && <div className='flavor'>{flavor_text}</div>}
    </div>
    {loyalty && <div className={statClass}>{loyalty}</div>}
    {power && toughness && <div className={statClass}>{power} / {toughness}</div>}
    {defense && <div className={statClass}>{defense}</div>}
  </div>
}
export const CardCustomRender = ({ card }: CardCustomRenderProps) => {
  const [flipped, setFlipped] = useState(false)
  let framedComponent
  switch (card.layout) {
    case 'split':
      if (card.keywords.includes("Aftermath")) {
        framedComponent = <AftermathCardRender card={card} />
      } else if (!card.set_name.includes("Playtest Card")) {
        framedComponent = <SplitCardRender card={card} />
      } else {
        framedComponent = <NormalCardRender card={card} flipped={flipped} />
      }
      break;
    case 'flip':
      framedComponent = <FlipCardRender card={card} flipped={flipped} />
      break;
    case 'transform':
      if (card.type_line.includes("Battle")) {
        framedComponent = <>grr im a battle!</>
        break;
      }
    // noinspection FallThroughInSwitchStatementJS
    case 'modal_dfc':
    case 'meld':
    case 'leveler':
    case 'saga':
    case 'adventure':
    case 'planar':
    case 'scheme':
    case 'vanguard':
    case 'token':
    case 'double_faced_token':
    case 'emblem':
    case 'augment':
    case 'host':
    case 'art_series':
    case 'double_sided':
    case 'normal':
    default:
      framedComponent = <NormalCardRender card={card} flipped={flipped} />
  }

  return <div className='custom-card-render border'>
    {framedComponent}
    {DOUBLE_FACED_LAYOUTS.includes(card.layout) && (
      <button
        className='flip-button'
        onClick={() => setFlipped((prev) => !prev)}
        title='flip'
      >🔄</button>
    )}
  </div>
}