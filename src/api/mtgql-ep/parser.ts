import { err, ok, Result } from 'neverthrow'
import { Alias, ParsedQuerySet, ParserError, QueryEnvironment, QueryMode, QueryWeight, Venn } from './types'
import { CogError, columnShower } from '../../error'
import { stdlib } from './aliasLibs'
import { injectPrefix, RunStrategy, weightAlgorithms } from '../queryRunnerCommon'
import cloneDeep from 'lodash/cloneDeep'

const ALIAS_REGEXP = /^@(a|alias):/
export const VENN_REGEXP = /^@(v|venn)/
const DEFAULT_DOMAIN_REGEXP = /^@(dd|defaultDomain)\((.+)\)$/
export const DEFAULT_WEIGHT_REGEXP = /^@(dw|defaultWeight):/
export const DEFAULT_MODE_REGEXP = /^@(dm|defaultMode):/
export const INCLUDE_REGEXP = /^@(include|i):/

export function alias(_line: string): Result<Alias, ParserError> {
  const line = _line.trim();
  if (!/^@a(lias)?:/.test(line))
    return err({ offset: 0, message: "alias must start with @a: or @alias:" });

  const colon = line.indexOf(":");

  let firstLeftParen = line.indexOf("(")
  if (firstLeftParen === colon+1) {
    return err({ message:`missing alias name`, offset: colon })
  } else if (firstLeftParen === -1) {
    return err({ message:`missing alias open parens`, offset: line.length - 1 })
  }
  if (line[line.length - 1] !== ")") {
    return err({ message:`missing alias close parens`, offset: line.length - 1 })
  }

  const name = line.substring(colon+1, firstLeftParen);
  const query = line.substring(firstLeftParen, line.length);
  let offset = query.indexOf(`@u:${name}`);
  if (offset !== -1)
    return err({ offset, message: `Alias uses its own name`});
  offset = query.indexOf(`@use:${name}`);
  if (offset !== -1)
    return err({ offset, message: `Alias uses its own name`});

  return ok<Alias>({ name, query })
}

function resolveAliases(aliases: { [name: string]: Alias }): Result<{ [name: string]: Alias }, ParserError> {
  const copy = cloneDeep(aliases);

  for (const key in copy) {
    const value = aliases[key];
    const res = replaceUse(aliases, value.query);
    if (res.isErr()) return err(res._unsafeUnwrapErr());

    copy[key] = { name: key, query: res._unsafeUnwrap() }
  }

  return ok(copy)
}

export function venn(_line: string): Result<Venn, ParserError> {
  const line = _line.trim();
  if (!line.startsWith("@venn("))
    return err({ offset: 0, message: "venn must start with @venn(" });

  let depth = 1;
  let index = 6;
  while (depth > 0 && index < line.length) {
    const char = line[index];

    switch (char) {
      case "(":
        depth++;
        break;
      case ")":
        depth--;
        break;
      default:
        break;
    }

    index++;
  }

  if (index === line.length) {
    return err({
      offset: index - 1,
      message: depth > 0
        ? "missing closing parentheses on left query"
        : "missing right query"
    });
  }

  const leftStart = 6;
  const leftEnd = index - 1;

  if (line[index++] !== "(")
    return err({ offset: index - 1, message: "missing opening parentheses on right query" });

  const rightStart = index;
  depth = 1;

  while (depth > 0 && index < line.length) {
    const char = line[index];

    switch (char) {
      case "(":
        depth++;
        break;
      case ")":
        depth--;
        break;
      default:
        break;
    }

    index++;
  }

  if (depth > 0)
    return err({ offset: index, message: "missing closing parentheses on right query"});
  if (index !== line.length)
    return err({ offset: index, message: "extra stuff found after venn(<left>)(<right>)"});

  const rightEnd = index - 1;

  return ok({
    left: line.substring(leftStart, leftEnd),
    right: line.substring(rightStart, rightEnd),
  })
}


export function replaceUse(aliases: { [key: string]: Alias }, _line: string): Result<string, ParserError> {
  let result = _line.trim();
  const usedAliasSet = new Set<string>();

  while (/(@u(?:se)?):([a-zA-Z0-9_-]+)/.test(result)) {
    const searchFor = /(@u(?:se)?):([a-zA-Z0-9_-]+)/g;
    const matches = Array.from(result.matchAll(searchFor));
    const namesUsedThisStep = new Set<string>();
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const name = match[2];
      if (usedAliasSet.has(name)) return err({ offset: searchFor.lastIndex - name.length, message: `Alias ${name} is part of a cycle.`})
      if (!aliases[name]) return err({ offset: searchFor.lastIndex - name.length, message: `unknown alias ${name}` });

      namesUsedThisStep.add(name);
      result = result.slice(0, match.index)
        + aliases[name].query
        + result.slice(match.index + match[0].length)
    }
    namesUsedThisStep.forEach(it => usedAliasSet.add(it));
  }

  return ok(result);
}


const DEFAULT_MODE: QueryMode = "sub"
const DEFAULT_WEIGHT: QueryWeight = "zipf"
export function parseQueryEnv(lines: string[]): Result<QueryEnvironment, CogError> {
  const now = new Date();
  const aliases: { [name: string]: Alias } = {}
  let defaultMode: QueryMode | undefined = undefined
  let defaultWeight: QueryWeight | undefined = undefined
  let defaultDomain: string | undefined = undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (ALIAS_REGEXP.test(trimmed)) {
      const aliasRes = alias(trimmed)
      if (aliasRes.isErr()) {
        const {message, offset} = aliasRes.error
        return err({
          query: trimmed,
          displayMessage: `syntax error for query ${i + 1} at col ${
            offset + 1
          }: ${message}\n` + columnShower(trimmed, offset)
        })
      }
      const aliasOk = aliasRes.value
      if (aliases[aliasOk.name] !== undefined) {
        return err({
          query: trimmed,
          displayMessage: `duplicate aliases named ${aliasOk.name} detected.\n`
            + `- @alias:${aliasOk.name}${aliases[aliasOk.name].query}\n- ${trimmed}`
        })
      }
      aliases[aliasOk.name] = aliasOk
    } else if (DEFAULT_WEIGHT_REGEXP.test(trimmed)) {
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
    } else if (DEFAULT_MODE_REGEXP.test(trimmed)) {
      const index = trimmed.indexOf(":");
      let value = trimmed.substring(index + 1);
      if (value === "allsub") value = "all";
      if (value === "basesub") value = "sub";
      switch (value) {
        case "all":
        case "sub":
        case "solo":
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
            displayMessage: `unrecognized aggregation mode ${value}. choose all, solo, or sub (default)`
          })
      }
    } else if (INCLUDE_REGEXP.test(trimmed)) {
      const index = trimmed.indexOf(":");
      const value = trimmed.substring(index + 1);
      switch (value) {
        case "stdlib":
          Object.assign(aliases, stdlib(now));
          break;
        default:
          break;
      }
    } else if (DEFAULT_DOMAIN_REGEXP.test(trimmed)) {
      if (defaultDomain !== undefined)
        return err({ query: trimmed, displayMessage: "Projects can only have one default domain" })
      const matches = trimmed.match(DEFAULT_DOMAIN_REGEXP);
      defaultDomain = matches[matches.length - 1];
    }
  }

  if (defaultDomain !== undefined) {
    const replaceResult = replaceUse(aliases, defaultDomain);
    if (replaceResult.isErr()) return err({ query: "", displayMessage: replaceResult._unsafeUnwrapErr().message });
    defaultDomain = replaceResult._unsafeUnwrap();
  }

  return resolveAliases(aliases)
    .map(resolvedAliases => ({
      aliases: resolvedAliases,
      defaultMode: defaultMode ?? DEFAULT_MODE,
      defaultWeight: defaultWeight ?? DEFAULT_WEIGHT,
      defaultDomain,
    }))
    .mapErr(e => ({ query: "", displayMessage: e.message }))
}

interface CollapsedQueries {
  collapsed: string[]
  // index -> lineIndex
  // comments are ignored and map to -1
  indexToCollapsedIndex: number[]
}

export function collapseMultiline(queries: string[]): CollapsedQueries {
  const indexToCollapsedIndex: number[] = [];
  const collapsed: string[] = [];
  let currentQuery: string[] = [];
  for (const query of queries) {
    const trimmed = query.trim();
    if (trimmed.startsWith("#")) {
      indexToCollapsedIndex.push(-1);
    } else {
      indexToCollapsedIndex.push(collapsed.length);
      currentQuery.push(query.replace(/\s*\\\s*$/, ""));
      if (!trimmed.endsWith("\\")) {
        collapsed.push(currentQuery.join(" "));
        currentQuery = [];
      }
    }

  }
  if (currentQuery.length) {
    collapsed.push(currentQuery.join(" "));
  }
  return { indexToCollapsedIndex, collapsed }
}

export function parseQuerySet(
  queries: string[],
  baseIndex: number,
  _selectedIndex?: number,
): Result<ParsedQuerySet, CogError>  {
  const selectedIndex = _selectedIndex ?? baseIndex;
  const { collapsed: collapsed, indexToCollapsedIndex } = collapseMultiline(queries);

  if (collapsed.length === 0) {
    return err({
      query: queries[baseIndex],
      displayMessage: `empty query for base query at line ${baseIndex + 1}\n -${queries[baseIndex]}`
    })
  }
  return parseQueryEnv(collapsed)
    .andThen(queryEnv => {
      let selectedQueries: string[] = []
      let currentIndex = indexToCollapsedIndex[baseIndex];
      while (currentIndex < collapsed.length && collapsed[currentIndex].trim() !== "") {
        const query = collapsed[currentIndex].trim()
        if (ALIAS_REGEXP.test(query)) {
          const name = query.substring(query.indexOf(":") + 1, query.indexOf("("))
          if (queryEnv.aliases[name]) {
            selectedQueries = [queryEnv.aliases[name].query]
          } else {
            return err({ query, displayMessage: `unknown alias ${name}` })
          }
        } else if (DEFAULT_DOMAIN_REGEXP.test(query)) {
          selectedQueries = [queryEnv.defaultDomain]
        } else if (!query.startsWith("#")) {
          const res = replaceUse(queryEnv.aliases, query)

          if (res.isErr()) {
            const error = res._unsafeUnwrapErr()
            return err({
              query,
              displayMessage: `syntax errors for query ${currentIndex + 1}:\n${error.message}${columnShower(query, error.offset)}`
            })
          }

          if (
            queryEnv.defaultMode !== "solo" ||
            // in solo mode collect base query and selected query
            (selectedQueries.length < 2 && (currentIndex === indexToCollapsedIndex[selectedIndex] || currentIndex === indexToCollapsedIndex[baseIndex]))
          ) {
            selectedQueries.push(res._unsafeUnwrap())
          }
        }
        currentIndex++
      }
      console.debug("selected queries:", selectedQueries);
      if (selectedQueries.length === 0) {
        return err({
          query: queries[baseIndex],
          displayMessage: `empty query for base query at line ${baseIndex + 1}\n -${queries[baseIndex]}`
        })
      }

      let [base, ...sub] = selectedQueries
      if (VENN_REGEXP.test(base)) {
        return venn(base)
          .andThen((venn) => {
            const leftReplaced = replaceUse(queryEnv.aliases, queryEnv.defaultDomain ? `${queryEnv.defaultDomain} (${venn.left})` : venn.left);
            const rightReplaced = replaceUse(queryEnv.aliases, queryEnv.defaultDomain ? `${queryEnv.defaultDomain} (${venn.right})` : venn.right);
            return Result.combineWithAllErrors([leftReplaced, rightReplaced])
              .map(([left, right]) => ({
                strategy: RunStrategy.Venn,
                queries: [left, right, ...sub],
                injectPrefix: ()=>"",
                getWeight: weightAlgorithms[queryEnv.defaultWeight],
              }))
              .mapErr((errors) => ({ query: base, displayMessage: errors.join("\n") }));
          })
          .mapErr((e: ParserError) => ({ query: base, displayMessage: `Error with venn query: ${e.message}\n\t${columnShower(base, e.offset)}`}))
      }
      if (queryEnv.defaultMode === 'all') {
        base = ""
        sub = selectedQueries
      }

      let prefixFunc = injectPrefix(base)
      if (queryEnv.defaultDomain !== undefined) {
        // assign old prefix func to new variable to prevent recursion
        const inner = prefixFunc;
        prefixFunc = (query) =>
          `${queryEnv.defaultDomain} (${inner(query)})`
      }

      return ok({
        strategy: RunStrategy.Search,
        queries: sub,
        injectPrefix: prefixFunc,
        getWeight: weightAlgorithms[queryEnv.defaultWeight],
      })
    })
}