import { OPERATORS } from './api/memory/filters/base'

export interface CogError {
  // query that caused the error
  query: string
  // error message meant to be displayed in the UI
  displayMessage: string
  // more detailed version that's used for populating bug reports
  debugMessage?: string
}

const opsFirstLetter = Object.values(OPERATORS).map((it) => it[0])
export const displayMessage = (
  query: string,
  index: number,
  offset: number,
) => {
  let baseMessage = `syntax error for query ${index + 1} at col ${
    offset + 1
  }.`
  if (offset > 0 && opsFirstLetter.includes(query[offset])) {
    const badKeyword = query
      .substring(0, offset)
      .split(/([ (])/)
      .pop()
    baseMessage = `unknown keyword "${badKeyword}" in query ${index + 1}`
  }

  return baseMessage + columnShower(query, offset)
}



export function columnShower (query: string, offset: number): string {
  return `\n\t${query}\n\t${' '.repeat(offset)}^`
}
