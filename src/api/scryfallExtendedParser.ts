import { ok, err, Result } from 'neverthrow'
import { injectPrefix, weightAlgorithms } from './queryRunnerCommon'

type QueryMode = "allsub" | "basesub"
type QueryWeight = "uniform" | "zipf"

interface Alias {
  name: string
  query: string
}

interface QueryEnvironment {
  domains: { [name: string]: Alias }
  defaultMode: QueryMode
  defaultWeight: QueryWeight
}


export const USE_REGEXP = /^@(u|use):/
export const ALIAS_REGEXP = /^@(a|alias):/
const DEFAULT_MODE: QueryMode = "basesub"
const DEFAULT_WEIGHT: QueryWeight = "zipf"

function parseAlias(alias: string): Result<Alias, string> {
  let firstLeftParen = alias.indexOf("(")
  if (firstLeftParen === 0) {
    return err(`missing alias name`)
  } else if (firstLeftParen === -1) {
    return err(`missing open parens`)
  }
  if (alias[alias.length - 1] !== ")") {
    return err(`missing final right parens`)
  }

  return ok<Alias>({
    name: alias.substring(0, firstLeftParen),
    query: alias.substring(firstLeftParen)
  })
}

export function parseEnv(lines: string[]): Result<QueryEnvironment, string> {
  const domains = {}
  let defaultMode: QueryMode | undefined = undefined
  let defaultWeight: QueryWeight | undefined = undefined

  for (const line of lines) {
    const trimmed = line.trim()
    if (ALIAS_REGEXP.test(trimmed)) {
      const index = trimmed.indexOf(":");
      const domain = parseAlias(trimmed.substring(index + 1))
      if (domain.isErr()) {
        return err(domain._unsafeUnwrapErr())
      }
      const unwrapped = domain._unsafeUnwrap()
      if (domains[unwrapped.name] !== undefined) {
        return err(`duplicate domains named ${unwrapped.name} detected`)
      }
      domains[unwrapped.name] = unwrapped
    } else if (/^@(dw|defaultWeight):/.test(trimmed)) {
      const index = trimmed.indexOf(":");
      const value = trimmed.substring(index + 1);
      switch (value) {
        case "zipf":
        case "uniform":
          if (defaultWeight !== undefined) {
            return err("duplicate default weights detected")
          }
          defaultWeight = value
          break;
        default:
          return err(`unrecognized weight algorithm ${value}. choose zipf or uniform`)
      }
    } else if (/^@(dm|defaultMode):/.test(trimmed)) {
      const index = trimmed.indexOf(":");
      const value = trimmed.substring(index + 1);
      switch (value) {
        case "allsub":
        case "basesub":
          if (defaultMode !== undefined) {
            return err("duplicate default modes detected")
          }
          defaultMode = value
          break;
        default:
          return err(`unrecognized aggregation mode ${value}. choose allsub or basesub`)
      }
    }
  }

  return ok({
    domains,
    defaultMode: defaultMode ?? DEFAULT_MODE,
    defaultWeight: defaultWeight ?? DEFAULT_WEIGHT,
  })
}
interface ParsedQuerySet {
  queries: string[]
  injectPrefix: (query: string) => string
  getWeight: (index: number) => number
}

export function parseQuerySet(queries: string[], baseIndex: number): Result<ParsedQuerySet, string>  {
  const queryEnvRes = parseEnv(queries)
  if (queryEnvRes.isErr()) {
    return err(queryEnvRes._unsafeUnwrapErr())
  }
  const queryEnv = queryEnvRes._unsafeUnwrap()
  let selectedQueries: string[] = []
  let currentIndex = baseIndex
  while (currentIndex < queries.length && queries[currentIndex].trim() !== "") {
    const query = queries[currentIndex].trim()
    if (ALIAS_REGEXP.test(query)) {
      const name = query.substring(query.indexOf(":") + 1, query.indexOf("("))
      if (queryEnv.domains[name] !== undefined) {
        selectedQueries = [queryEnv.domains[name].query]
      } else {
        return err(`unknown alias ${name}`)
      }
    } else if (!query.startsWith("#")) {
      // this isn't ideal: still replaces @use tokens inside of strings and such.
      // @use tokens have been designed to not overlap with scryfall syntax or magic data
      const splittered = queries[currentIndex].split(/ +/)
        .map(it => {
          if (USE_REGEXP.test(it)) {
            const name = it.substring(it.indexOf(":") + 1)
            if (queryEnv.domains[name] !== undefined) {
              return queryEnv.domains[name].query
            } else {
              // todo: propagate an error?
              console.warn(`ignoring unknown alias ${name}`)
              return ""
            }
          }
          return it
        })
      selectedQueries.push(splittered.join(" "))
    }
    currentIndex++
  }
  console.debug(selectedQueries)
  if (selectedQueries.length === 0) {
    return err(`empty query for base query at line ${baseIndex + 1}`)
  }

  let [base, ...sub] = selectedQueries
  if (queryEnv.defaultMode === 'allsub') {
    base = ""
    sub = selectedQueries
  }

  return ok({
    queries: sub,
    injectPrefix: injectPrefix(base),
    getWeight: weightAlgorithms[queryEnv.defaultWeight],
  })
}