export interface NearlyError extends Error {
  offset: number
}

export interface SearchError {
  query: string
  errorOffset: number
  message: string
}