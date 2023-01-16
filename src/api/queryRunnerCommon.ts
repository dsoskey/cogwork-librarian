import Scry, { SearchOptions } from 'scryfall-sdk'
import { TaskStatus } from 'src/types';
import { QueryReport } from 'src/api/useReporter';

export interface EnrichedCard {
    weight: number
    data: Scry.Card
    matchedQueries: string[]
}

export interface QueryRunnerProps {
    getWeight?: (index: number) => number
    injectPrefix?: (query: string) => string,
}

export interface QueryHandler {
    result: Array<EnrichedCard>
    status: TaskStatus,
    report: QueryReport,
}

export interface QueryRunner extends QueryHandler {
    execute: (queries: string[], options: SearchOptions) => void
    result: Array<EnrichedCard>
    status: TaskStatus,
    report: QueryReport,
}

export const weightAlgorithms = {
    zipf: (index: number) => 1 / (index + 2),
    uniform: (_: number) => 1,
}

export const injectors = {
    noDigital: (query: string) => `-is:digital (${query})`,
    noToken: (query: string) => `-type:token (${query})`,
}
