import { ManaSymbol, toSplitCost } from '../../api/memory/types/card'
import { ManaIcon } from './manaSymbol'
import React from 'react'

interface ManaCostProps {
  manaCost: string
}
export const ManaCost = ({ manaCost }: ManaCostProps) => {
  const split = manaCost.split(" // ");

  return <>
    {toSplitCost(split[0]).map((it, index) => <ManaIcon key={index} symbol={it as ManaSymbol} />)}
    {split.length > 1 && <>
      <code>{" // "}</code>
      {toSplitCost(split[1]).map((it, index) => <ManaIcon key={index} symbol={it as ManaSymbol} />)}
    </>}
  </>
}
