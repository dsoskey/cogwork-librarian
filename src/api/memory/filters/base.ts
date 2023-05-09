import { Operator } from '../oracleFilter'

export type Filter<T> = (it: T) => boolean

export interface FilterRes<T> {
  filtersUsed: string[]
  filterFunc: Filter<T>
  inverseFunc?: Filter<T>
}

export const identity =
  <T>(): Filter<T> =>
  (_) =>
    true

export const identityRes = <T>(): FilterRes<T> => ({
  filtersUsed: ['identity'],
  filterFunc: identity(),
})

export const and = <T>(clause1: Filter<T>, clause2: Filter<T>): Filter<T> => {
  return (c: T) => clause1(c) && clause2(c)
}

export const andRes = <T>(
  clause1: FilterRes<T>,
  clause2: FilterRes<T>
): FilterRes<T> => {
  return {
    filtersUsed: [
      '(',
      ...clause1.filtersUsed,
      'and',
      ...clause2.filtersUsed,
      ')',
    ],
    filterFunc: and(clause1.filterFunc, clause2.filterFunc),
  }
}

export const or = <T>(clause1: Filter<T>, clause2: Filter<T>): Filter<T> => {
  return (c: T) => clause1(c) || clause2(c)
}

export const orRes = <T>(
  clause1: FilterRes<T>,
  clause2: FilterRes<T>
): FilterRes<T> => {
  return {
    filtersUsed: [
      '(',
      ...clause1.filtersUsed,
      'or',
      ...clause2.filtersUsed,
      ')',
    ],
    filterFunc: or(clause1.filterFunc, clause2.filterFunc),
  }
}

export const not = <T>(clause: Filter<T>): Filter<T> => {
  return (c: T) => !clause(c)
}

export const notRes = <T>(clause: FilterRes<T>): FilterRes<T> => {
  if (clause.inverseFunc !== undefined) {
    return {
      filtersUsed: ['(', 'not', ...clause.filtersUsed, ')'],
      filterFunc: clause.inverseFunc,
      inverseFunc: clause.filterFunc,
    }
  }
  return {
    filtersUsed: ['(', 'not', ...clause.filtersUsed, ')'],
    filterFunc: (c: T) => !clause.filterFunc(c),
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
