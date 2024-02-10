import { ObjectValues } from '../types/common'
import { NormedCard, OracleKeys, PrintingFilterTuple } from '../types/normedCard'
export const EQ_OPERATORS = {
  ':': ':',
  '=': '=',
} as const
export type EqualityOperator = ObjectValues<typeof EQ_OPERATORS>

export const OPERATORS = {
  ...EQ_OPERATORS,
  '!=': '!=',
  '<>': '<>',
  '<': '<',
  '<=': '<=',
  '>': '>',
  '>=': '>=',
} as const
export type Operator = ObjectValues<typeof OPERATORS>

export type Filter<T> = (it: T) => boolean

export interface FilterNode {
  filtersUsed: string[]
  filterFunc: Filter<NormedCard>
  inverseFunc?: Filter<NormedCard>
  printFilter: Filter<PrintingFilterTuple>
  printInverse?: Filter<PrintingFilterTuple>
  clause1?: FilterNode
  clause2?: FilterNode
}

export const identity =
  <T>(): Filter<T> =>
  (_) =>
    true

export const identityNode = (): FilterNode => ({
  filtersUsed: ['identity'],
  filterFunc: identity(),
  printFilter: identity(),
  printInverse: identity(),
})

export const and = <T>(clause1: Filter<T>, clause2: Filter<T>): Filter<T> =>
  (c: T) => clause1(c) && clause2(c)


export const or = <T>(clause1: Filter<T>, clause2: Filter<T>): Filter<T> =>
  (c: T) => clause1(c) || clause2(c)


export const andNode = (
  clause1: FilterNode,
  clause2: FilterNode
): FilterNode => {
  return {
    filtersUsed: ['(', ...clause1.filtersUsed, 'and', ...clause2.filtersUsed, ')'],
    filterFunc: and(clause1.filterFunc, clause2.filterFunc),
    printFilter: and(clause1.printFilter, clause2.printFilter),
    clause1,
    clause2,
  }
}

export const orNode = (
  clause1: FilterNode,
  clause2: FilterNode
): FilterNode => {
  return {
    filtersUsed: ['(', ...clause1.filtersUsed, 'or', ...clause2.filtersUsed, ')',],
    filterFunc: or(clause1.filterFunc, clause2.filterFunc),
    printFilter: or(clause1.printFilter, clause2.printFilter),
    clause1,
    clause2,
  }
}

export const not = <T>(clause: Filter<T>): Filter<T> => {
  return (c: T) => !clause(c)
}

export const notNode = (clause: FilterNode): FilterNode => {
  const filterFunc = clause.inverseFunc !== undefined ?
    clause.inverseFunc : (c) => !clause.filterFunc(c)
  const inverseFunc = clause.inverseFunc !== undefined ?
    clause.filterFunc : undefined
  const printFilter = clause.printInverse !== undefined ?
    clause.printInverse : (p) => !clause.printFilter(p)
  const printInverse = clause.printInverse !== undefined ?
    clause.printFilter : undefined

  return {
    filtersUsed: ['(', 'not', ...clause.filtersUsed, ')'],
    filterFunc,
    inverseFunc,
    printFilter,
    printInverse,
    clause1: clause,
  }
}

export const defaultOperation =
  (field: OracleKeys, operator: Operator, value: any): Filter<NormedCard> =>
    (card: NormedCard) => {
      const cardValue = card[field]
      if (cardValue === undefined) return false
      return defaultCompare(cardValue, operator, value)
    }

/**
 * left and right must be comparable using builtin operators
 * @param left hand side of comparison
 * @param operator to use in comparison
 * @param right hand side of comparison
 */
export const defaultCompare = <T>(left: T, operator: Operator, right: T) => {
  switch (operator) {
    case '=':
    case ':':
      return left === right
    case '!=':
    case '<>':
      return left !== right
    case '>':
      return left > right
    case '>=':
      return left >= right
    case '<':
      return left < right
    case '<=':
      return left <= right
  }
}
