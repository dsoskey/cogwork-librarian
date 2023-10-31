import { FilterType } from './filterKeyword'
import { Prices } from 'scryfall-sdk'
import { Operator } from '../filters/base'

export interface AstLeaf {
  filter: FilterType
  unit?: keyof Prices
  operator?: Operator
  value: any
}

export interface BinaryNode {
  operator: "and" | "or"
  left: AstNode
  right: AstNode
}

export interface UnaryNode {
  operator: "negate"
  clause: AstNode
}

export type AstNode = BinaryNode | AstLeaf | UnaryNode