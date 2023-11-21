import { ok, err, Result } from 'neverthrow'
import { format } from 'date-fns'
import { injectPrefix, weightAlgorithms } from './queryRunnerCommon'
import { CogError, columnShower } from '../error'

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

interface AliasError {
  message: string
  offset: number
}

function parseAlias(alias: string): Result<Alias, AliasError> {
  let firstLeftParen = alias.indexOf("(")
  if (firstLeftParen === 0) {
    return err({ message:`missing alias name`, offset: 0 })
  } else if (firstLeftParen === -1) {
    return err({ message:`missing open parens`, offset: alias.length - 1 })
  }
  if (alias[alias.length - 1] !== ")") {
    return err({ message:`missing final right parens`, offset: alias.length - 1 })
  }

  return ok<Alias>({
    name: alias.substring(0, firstLeftParen),
    query: alias.substring(firstLeftParen)
  })
}

export function parseEnv(lines: string[]): Result<QueryEnvironment, CogError> {
  const now = new Date();
  const aliases: { [name: string]: Alias } = {}
  let defaultMode: QueryMode | undefined = undefined
  let defaultWeight: QueryWeight | undefined = undefined

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (ALIAS_REGEXP.test(trimmed)) {
      const index = trimmed.indexOf(":");
      const aliasRes = parseAlias(trimmed.substring(index + 1))
      if (aliasRes.isErr()) {
        const {message, offset} = aliasRes.error
        return err({
          query: trimmed,
          displayMessage: `syntax error for query ${index + 1} at col ${
            offset + 1
          }: ${message}` + columnShower(trimmed, offset)
        })
      }
      const alias = aliasRes.value
      if (aliases[alias.name] !== undefined) {
        return err({
          query: trimmed,
          displayMessage: `duplicate aliases named ${alias.name} detected.\n`
          + `- @alias:${alias.name}${aliases[alias.name].query}\n- ${trimmed}`
        })
      }
      aliases[alias.name] = alias
    } else if (/^@(dw|defaultWeight):/.test(trimmed)) {
      const index = trimmed.indexOf(":");
      const value = trimmed.substring(index + 1);
      switch (value) {
        case "zipf":
        case "uniform":
          if (defaultWeight !== undefined) {
            return err({
              query: trimmed,
              displayMessage:"duplicate default weights detected"
            })
          }
          defaultWeight = value
          break;
        default:
          return err({
            query: trimmed,
            displayMessage: `unrecognized weight algorithm ${value}. choose zipf or uniform`
          })
      }
    } else if (/^@(dm|defaultMode):/.test(trimmed)) {
      const index = trimmed.indexOf(":");
      const value = trimmed.substring(index + 1);
      switch (value) {
        case "allsub":
        case "basesub":
          if (defaultMode !== undefined) {
            return err({
              query: trimmed,
              displayMessage: "duplicate default modes detected"
            })
          }
          defaultMode = value
          break;
        default:
          return err({
            query: trimmed,
            displayMessage: `unrecognized aggregation mode ${value}. choose allsub or basesub`
          })
      }
    } else if (/^@(include|i):/.test(trimmed)) {
      const index = trimmed.indexOf(":");
      const value = trimmed.substring(index + 1);
      switch (value) {
        case "stdlib":
          aliases.released = { name: "released", query: `date<=${format(now, "yyyy-MM-dd")}` }
          aliases.newest = { name: "newest", query: `order:released direction:desc` }
      }
    }
  }

  return ok({
    domains: aliases,
    defaultMode: defaultMode ?? DEFAULT_MODE,
    defaultWeight: defaultWeight ?? DEFAULT_WEIGHT,
  })
}
interface ParsedQuerySet {
  queries: string[]
  injectPrefix: (query: string) => string
  getWeight: (index: number) => number
}

export function parseQuerySet(
  queries: string[],
  baseIndex: number
): Result<ParsedQuerySet, CogError>  {
  const queryEnvRes = parseEnv(queries)
  if (queryEnvRes.isErr()) {
    return err(queryEnvRes.error)
  }
  const queryEnv = queryEnvRes.value
  let selectedQueries: string[] = []
  let currentIndex = baseIndex
  while (currentIndex < queries.length && queries[currentIndex].trim() !== "") {
    const query = queries[currentIndex].trim()
    if (ALIAS_REGEXP.test(query)) {
      const name = query.substring(query.indexOf(":") + 1, query.indexOf("("))
      if (queryEnv.domains[name] !== undefined) {
        selectedQueries = [queryEnv.domains[name].query]
      } else {
        return err({
          query,
          displayMessage: `unknown alias ${name}`,
        })
      }
    } else if (!query.startsWith("#")) {
      // this isn't ideal: still replaces @use tokens inside of strings and such.
      // @use tokens have been designed to not overlap with scryfall syntax or magic data
      const splittered = queries[currentIndex].split(/ +/)
        .map(it => {
          if (USE_REGEXP.test(it)) {
            const name = it.substring(it.indexOf(":") + 1)
            if (queryEnv.domains[name] !== undefined) {
              return ok(queryEnv.domains[name].query)
            } else {
              // this should never get hit
              return err(`unknown alias ${name}`)
            }
          }
          return ok(it)
        })
      const errors = splittered.filter(it => it.isErr())
      if (errors.length) {
        const aggedErrors = errors.map(it => `  - ${it._unsafeUnwrapErr()}`)
          .join("\n")
        return err({
          query,
          displayMessage: `syntax errors for query ${currentIndex + 1}:\n${aggedErrors}` + columnShower(queries[currentIndex], 0)
        })
      }

      selectedQueries.push(splittered.map(it => it._unsafeUnwrap()).join(" ").trim())
    }
    currentIndex++
  }
  console.debug(selectedQueries)
  if (selectedQueries.length === 0) {
    return err({
      query: queries[baseIndex],
      displayMessage: `empty query for base query at line ${baseIndex + 1}\n -${queries[baseIndex]}`
    })
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