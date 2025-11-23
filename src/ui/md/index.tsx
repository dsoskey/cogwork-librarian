// Most of this directory is shamelessly stolen from CubeCobra to maintain compatibility with existing cubes

import React from 'react'
import gfm from 'remark-gfm';
import breaks from 'remark-breaks';
import cardrow from './cardrow'
import cardlink from './cardlink'
import centering from './centering'
import symbol from './symbols'
import { ManaIcon } from '../card/manaSymbol'
import { CardNameLink, MDCardImage } from '../card/CardLink'
export const REMARK_PLUGINS = [cardrow, centering, cardlink, [gfm, { singleTilde: false }], symbol, breaks]

const MDSymbol = ({ value }) => {
  return <ManaIcon symbol={value} />
}

const MDCardRow = ({ children, inParagraph }) => {
  if (inParagraph) {
    return <span className="card-row row">{children}</span>
  }
  return <div className="card-row row">{children}</div>
}

export const MD_RENDERERS = {
  symbol: MDSymbol,
  cardlink: CardNameLink,
  cardimage: MDCardImage,
  cardrow: MDCardRow,
}