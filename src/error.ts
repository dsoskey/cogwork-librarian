import { OPERATORS } from './api/memory/oracleFilter'

export interface CogError {
  // query that caused the error
  query: string
  // error message meant to be displayed in the UI
  displayMessage: string
  // more detailed version that's used for populating bug reports
  debugMessage: string
}

export interface NearlyError extends Error {
  offset: number
}

const opsFirstLetter = Object.values(OPERATORS).map((it) => it[0])
export const displayMessage = (
  query: string,
  index: number,
  e: NearlyError
) => {
  let baseMessage = `syntax error for query ${index + 1} at col ${
    e.offset + 1
  }.`
  if (e.offset > 0 && opsFirstLetter.includes(query[e.offset])) {
    const badKeyword = query
      .substring(0, e.offset)
      .split(/([ (])/)
      .pop()
    baseMessage = `unknown keyword "${badKeyword}" in query ${index + 1}`
  }
  const columnShower = `\n\t${query}\n\t${' '.repeat(e.offset)}^`

  return baseMessage + columnShower
}
