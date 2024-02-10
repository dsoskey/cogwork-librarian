import { ManaSymbol } from '../../mql'
import React from 'react'

const symbolToClassName: Record<ManaSymbol, string> = {
  "2/b": '2b',
  "2/g": '2g',
  "2/r": '2r',
  "2/u": '2u',
  "2/w": '2w',
  "b/2": '2b',
  "b/g": 'bg',
  "b/p": 'bp',
  "b/r": 'br',
  "b/u": 'ub',
  "b/w": 'wb',
  "g/2": '2g',
  "g/b": 'bg',
  "g/p": 'gp',
  "g/r": 'rg',
  "g/u": 'gu',
  "g/w": 'gw',
  "p/b": 'bp',
  "p/g": 'gp',
  "p/r": 'rp',
  "p/u": 'up',
  "p/w": 'wp',
  "r/2": '2r',
  "r/b": 'rb',
  "r/g": 'rg',
  "r/p": 'rp',
  "r/u": 'ur',
  "r/w": 'rw',
  "u/2": '2u',
  "u/b": 'ub',
  "u/g": 'gu',
  "u/p": 'up',
  "u/r": 'ur',
  "u/w": 'wu',
  "w/2": '2w',
  "w/b": 'wb',
  "w/g": 'gw',
  "w/p": 'wp',
  "w/r": 'rw',
  "w/u": 'wu',
  // @ts-ignore
  "r/g/p": "rgp",
  "g/w/p": "gwp",
  "w/u/p": "wup",
  "g/u/p": "gup",
  "u/g/p": "gup",
  "r/w/p": "rwp",
  "w/r/p": "rwp",
  "w/b/p": "wbp",
  b: 'b',
  c: 'c',
  g: 'g',
  generic: 'g',
  r: 'r',
  s: 's',
  u: 'u',
  w: 'w',
  x: 'x',
  y: 'y'
}

interface ManaIconProps {
  symbol: ManaSymbol
}
export const ManaIcon = ({ symbol }: ManaIconProps) => {
  return <i className={`ms ms-${symbolToClassName[symbol] ?? symbol} ms-cost ms-shadow`}/>
}