import { FilterType } from './filterKeyword'
import { Prices } from 'scryfall-sdk'
import { Operator } from '../filters/base'

interface AstNodeCommon {
  offset: number
}
export interface AstLeaf extends AstNodeCommon {
  filter: FilterType
  unit?: keyof Prices
  operator?: Operator
  value: any
}

export interface BinaryNode extends AstNodeCommon {
  operator: "and" | "or"
  left: AstNode
  right: AstNode
}

export interface UnaryNode extends AstNodeCommon {
  operator: "negate"
  clause: AstNode
}

export type AstNode = BinaryNode | AstLeaf | UnaryNode