export type Filter<T> = (it: T) => boolean

// TODO: try out FilterRes for passing state
interface FilterRes<T> {
  filtersUsed: string[]
  func: Filter<T>
}
export const identity =
  <T>(): Filter<T> =>
  (_) =>
    true

export const and = <T>(clause1: Filter<T>, clause2: Filter<T>): Filter<T> => {
  return (c: T) => clause1(c) && clause2(c)
}

export const or = <T>(clause1: Filter<T>, clause2: Filter<T>): Filter<T> => {
  return (c: T) => clause1(c) || clause2(c)
}

export const not = <T>(clause: Filter<T>): Filter<T> => {
  return (c: T) => !clause(c)
}
