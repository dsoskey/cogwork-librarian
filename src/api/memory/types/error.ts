export interface NearlyError extends Error {
  offset: number
}

export interface FilterError {
  errorOffset: number
  message: string
}

export interface SearchError {
  query: string
  errorOffset: number
  message: string
}