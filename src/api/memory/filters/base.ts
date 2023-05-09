import { Operator } from '../oracleFilter'

export type Filter<T> = (it: T) => boolean

export interface FilterNode<T> {
  filtersUsed: string[]
  filterFunc: Filter<T>
  inverseFunc?: Filter<T>
  clause1?: FilterNode<T>
  clause2?: FilterNode<T>
}

export const identity =
  <T>(): Filter<T> =>
  (_) =>
    true

export const identityNode = <T>(): FilterNode<T> => ({
  filtersUsed: ['identity'],
  filterFunc: identity(),
})

export const and = <T>(clause1: Filter<T>, clause2: Filter<T>): Filter<T> => {
  return (c: T) => clause1(c) && clause2(c)
}

export const andNode = <T>(
  clause1: FilterNode<T>,
  clause2: FilterNode<T>
): FilterNode<T> => {
  return {
    filtersUsed: [
      '(',
      ...clause1.filtersUsed,
      'and',
      ...clause2.filtersUsed,
      ')',
    ],
    filterFunc: and(clause1.filterFunc, clause2.filterFunc),
    clause1,
    clause2,
  }
}

export const or = <T>(clause1: Filter<T>, clause2: Filter<T>): Filter<T> => {
  return (c: T) => clause1(c) || clause2(c)
}

export const orNode = <T>(
  clause1: FilterNode<T>,
  clause2: FilterNode<T>
): FilterNode<T> => {
  return {
    filtersUsed: [
      '(',
      ...clause1.filtersUsed,
      'or',
      ...clause2.filtersUsed,
      ')',
    ],
    filterFunc: or(clause1.filterFunc, clause2.filterFunc),
    clause1,
    clause2,
  }
}

export const not = <T>(clause: Filter<T>): Filter<T> => {
  return (c: T) => !clause(c)
}

export const notNode = <T>(clause: FilterNode<T>): FilterNode<T> => {
  if (clause.inverseFunc !== undefined) {
    return {
      filtersUsed: ['(', 'not', ...clause.filtersUsed, ')'],
      filterFunc: clause.inverseFunc,
      inverseFunc: clause.filterFunc,
      clause1: clause,
    }
  }
  return {
    filtersUsed: ['(', 'not', ...clause.filtersUsed, ')'],
    filterFunc: (c: T) => !clause.filterFunc(c),
    clause1: clause,
  }
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
