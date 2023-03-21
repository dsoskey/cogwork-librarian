import Scry, { SearchOptions } from 'scryfall-sdk'
import { TaskStatus } from 'src/types'
import { QueryReport } from 'src/api/useReporter'
import { ResultAsync } from 'neverthrow'
import { CogError } from '../error'

export type QueryRunnerFunc = (
  query: string,
  index: number,
  options: SearchOptions
) => ResultAsync<string, CogError>

export type ErrorMap = { [key: string]: CogError }

export interface EnrichedCard {
  weight: number
  data: Scry.Card
  matchedQueries: string[]
}

export interface QueryRunnerProps {
  getWeight?: (index: number) => number
  injectPrefix?: (query: string) => string
}

export interface QueryHandler {
  result: Array<EnrichedCard>
  status: TaskStatus
  report: QueryReport
  errors: CogError[]
}

export interface QueryRunner extends QueryHandler {
  run: (queries: string[], options: SearchOptions) => void
  result: Array<EnrichedCard>
  status: TaskStatus
  report: QueryReport
}

export const SCORE_PRECISION = 2

export const weightAlgorithms = {
  zipf: (index: number) => 1 / (index + 2),
  uniform: (_: number) => 1,
}

// useQueryCoordinator filters out empty queries so empty query handling is never reached
// idea: queryCoordinator sends off one empty query if the whole array is empty OR
// queryCoordinator throws an error if there are no base queries
export const injectPrefix =
  (prefix: string) =>
  (query: string): string => {
    const trimmedPrefix = prefix.trim()
    const trimmedQuery = query.trim()
    const prefixEmpty = trimmedPrefix.length === 0
    const queryEmpty = trimmedQuery.length === 0
    if (prefixEmpty && queryEmpty) {
      return ''
    } else if (prefixEmpty) {
      return query
    } else if (queryEmpty) {
      return prefix
    } else {
      return `${prefix} (${query})`
    }
  }
