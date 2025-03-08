import { SearchError, OPERATORS } from 'mtgql'
import React from 'react'

export interface CogError {
  // query that caused the error
  query: string
  // error message meant to be displayed in the UI
  displayMessage: React.ReactNode
  // more detailed version that's used for populating bug reports
  debugMessage?: string
}

const opsFirstLetter = Object.values(OPERATORS).map((it) => it[0])
export const displayMessage = (error: SearchError, index: number) => {
  const { type, errorOffset: offset, query } = error;
  let baseMessage = `${type} error for query ${index + 1} at col ${
    offset + 1
  }.`
  if (offset > 0 && opsFirstLetter.includes(query[offset])) {
    const badKeyword = query
      .substring(0, offset)
      .split(/([ (])/)
      .pop()
    baseMessage = `unknown keyword "${badKeyword}" in query ${index + 1}`
  }
  const footerMessage = error.type === "internal"
    ? "\n\tPlease report this message using the 'report a bug' link in the footer."
    : "";

  return `${baseMessage}\n\t${columnShower(query, offset)}\n\t${error.message}${footerMessage}`
}



export function columnShower (query: string, offset: number): string {
  return `${query}\n\t${' '.repeat(offset >= 0 ? offset : 0)}^`
}
