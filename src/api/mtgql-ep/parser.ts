import { Alias, ParsedQuerySet, ParserError, QueryEnvironment, QueryMode, QueryWeight, Venn } from './types'
import { columnShower } from '../../error'
import { stdlib } from './aliasLibs'
import { injectPrefix, RunStrategy, weightAlgorithms } from '../queryRunnerCommon'
import cloneDeep from 'lodash/cloneDeep'

const ALIAS_REGEXP = /^@(a|alias):/
export const VENN_REGEXP = /^@(v|venn)/
const DEFAULT_DOMAIN_REGEXP = /^@(dd|defaultDomain)\((.+)\)$/
export const DEFAULT_WEIGHT_REGEXP = /^@(dw|defaultWeight):/
export const DEFAULT_MODE_REGEXP = /^@(dm|defaultMode):/
export const INCLUDE_REGEXP = /^@(include|i):/

export function alias(_line: string): Alias {
  const line = _line.trim();
  if (!/^@a(lias)?:/.test(line))
    throw new ParserError('alias must start with "@a:" or "@alias:".', 0);

  const colon = line.indexOf(":");

  let firstLeftParen = line.indexOf("(")
  if (firstLeftParen === colon+1) {
    throw new ParserError(`Alias is missing a name.`, colon)
  } else if (firstLeftParen === -1) {
    throw new ParserError(`Alias is missing open parens.`, colon + 1)
  }
  if (line[line.length - 1] !== ")") {
    throw new ParserError(`Alias is missing close parens.`, line.length - 1)
  }

  const name = line.substring(colon+1, firstLeftParen);
  const query = line.substring(firstLeftParen, line.length);
  let offset = query.indexOf(`@u:${name}`);
  if (offset !== -1)
    throw new ParserError(
      `Alias ${name} can't reference itself.`,
      offset + firstLeftParen + 3
    );
  offset = query.indexOf(`@use:${name}`);
  if (offset !== -1)
    throw new ParserError(
      `Alias ${name} can't reference itself.`,
      offset + firstLeftParen + 5
    );

  return { name, query }
}

function resolveAliases(aliases: { [name: string]: Alias }): { [name: string]: Alias } {
  const copy = cloneDeep(aliases);

  for (const key in copy) {
    const value = aliases[key];
    const res = replaceUse(aliases, value.query);

    copy[key] = { name: key, query: res }
  }

  return copy
}

export function venn(_line: string): Venn {
  const line = _line.trim();
  if (!line.startsWith("@venn("))
    throw new ParserError('Venn search must start with "@venn("', 0);

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
    throw new ParserError(depth > 0
      ? "Venn search is missing closing parentheses on left query."
      : "Venn search is missing right query.", index-1)
  }

  const leftStart = 6;
  const leftEnd = index - 1;

  if (line[index++] !== "(")
    throw new ParserError("Venn search is missing opening parentheses on right query.", index-1)

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
    throw new ParserError("Venn search is missing closing parentheses on right query.", index);
  if (index !== line.length)
    throw new ParserError("Extra stuff found after @venn(<left>)(<right>)", index);

  const rightEnd = index - 1;

  return {
    left: line.substring(leftStart, leftEnd),
    right: line.substring(rightStart, rightEnd),
  }
}


export function replaceUse(aliases: { [key: string]: Alias }, _line: string): string {
  let result = _line.trim();
  const usedAliasSet = new Set<string>();

  while (/(@u(?:se)?):([a-zA-Z0-9_-]+)/.test(result)) {
    const searchFor = /(@u(?:se)?):([a-zA-Z0-9_-]+)/g;
    const matches = Array.from(result.matchAll(searchFor));
    const namesUsedThisStep = new Set<string>();
    for (let i = matches.length - 1; i >= 0; i--) {
      const match = matches[i];
      const name = match[2];
      if (usedAliasSet.has(name))
        throw new ParserError(`Alias ${name} is part of a cycle.`, result.lastIndexOf(match[0]) + match[1].length + 1)
      if (!aliases[name])
        throw new ParserError(`Unknown alias ${name}`, result.lastIndexOf(match[0]) + match[1].length + 1)

      namesUsedThisStep.add(name);
      result = result.slice(0, match.index)
        + aliases[name].query
        + result.slice(match.index + match[0].length)
    }
    namesUsedThisStep.forEach(it => usedAliasSet.add(it));
  }

  return result;
}


const DEFAULT_MODE: QueryMode = "sub"
const DEFAULT_WEIGHT: QueryWeight = "zipf"
export function parseQueryEnv(lines: string[]): QueryEnvironment {
  const now = new Date();
  const aliases: { [name: string]: Alias } = {}
  let defaultMode: QueryMode | undefined = undefined
  let defaultWeight: QueryWeight | undefined = undefined
  let defaultDomain: string | undefined = undefined;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (ALIAS_REGEXP.test(trimmed)) {
      let aliasResult: Alias
      try {
        aliasResult = alias(trimmed);

      } catch (e) {
        const {message, offset} = e;
        throw {
          query: trimmed,
          displayMessage: `Syntax error for query ${i + 1} at col ${offset + 1}:`
            + `\n\t${columnShower(trimmed, offset)}`
            + `\n\t${message}`
        }
      }
      if (aliases[aliasResult.name] !== undefined) {
        throw {
          query: trimmed,
          displayMessage: `Duplicate aliases named ${aliasResult.name} detected.\n`
            + `- @alias:${aliasResult.name}${aliases[aliasResult.name].query}\n- ${trimmed}`
        }
      }
      aliases[aliasResult.name] = aliasResult
    } else if (DEFAULT_WEIGHT_REGEXP.test(trimmed)) {
      const index = trimmed.indexOf(":");
      const value = trimmed.substring(index + 1);
      switch (value) {
        case "zipf":
        case "uniform":
          if (defaultWeight !== undefined) {
            throw {
              query: trimmed,
              displayMessage:"duplicate default weights detected"
            }
          }
          defaultWeight = value
          break;
        default:
          throw {
            query: trimmed,
            displayMessage: `unrecognized weight algorithm ${value}. choose zipf or uniform`
          }
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
            throw {
              query: trimmed,
              displayMessage: "duplicate default modes detected"
            }
          }
          defaultMode = value
          break;
        default:
          throw {
            query: trimmed,
            displayMessage: `unrecognized aggregation mode ${value}. choose all, solo, or sub (default)`
          }
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
        throw { query: trimmed, displayMessage: "Projects can only have one default domain" }
      const matches = trimmed.match(DEFAULT_DOMAIN_REGEXP);
      defaultDomain = matches[matches.length - 1];
    }
  }

  if (defaultDomain !== undefined) {
    defaultDomain = replaceUse(aliases, defaultDomain);
  }

  const resolvedAliases = resolveAliases(aliases);
  return {
    aliases: resolvedAliases,
    defaultMode: defaultMode ?? DEFAULT_MODE,
    defaultWeight: defaultWeight ?? DEFAULT_WEIGHT,
    defaultDomain,
  }
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
): ParsedQuerySet  {
  const selectedIndex = _selectedIndex ?? baseIndex;
  const { collapsed: collapsed, indexToCollapsedIndex } = collapseMultiline(queries);

  if (collapsed.length === 0) {
    throw {
      query: queries[baseIndex],
      displayMessage: `empty query for base query at line ${baseIndex + 1}\n -${queries[baseIndex]}`
    }
  }
  const queryEnv = parseQueryEnv(collapsed);
  let selectedQueries: string[] = []
  let currentIndex = indexToCollapsedIndex[baseIndex];
  while (currentIndex < collapsed.length && collapsed[currentIndex].trim() !== "") {
    const query = collapsed[currentIndex].trim()
    if (ALIAS_REGEXP.test(query)) {
      const name = query.substring(query.indexOf(":") + 1, query.indexOf("("))
      if (queryEnv.aliases[name]) {
        selectedQueries = [queryEnv.aliases[name].query]
      } else {
        throw { query, displayMessage: `unknown alias ${name}` }
      }
    } else if (DEFAULT_DOMAIN_REGEXP.test(query)) {
      selectedQueries = [queryEnv.defaultDomain]
    } else if (!query.startsWith("#")) {
      try {
        const res = replaceUse(queryEnv.aliases, query)
        if (
          queryEnv.defaultMode !== "solo" ||
          // in solo mode collect base query and selected query
          (selectedQueries.length < 2 && (currentIndex === indexToCollapsedIndex[selectedIndex] || currentIndex === indexToCollapsedIndex[baseIndex]))
        ) {
          selectedQueries.push(res)
        }
      } catch (e) {
        const error = e as ParserError
        throw {
          query,
          displayMessage: `Syntax errors for query ${currentIndex + 1} at col ${error.offset + 1}:`
            + `\n\t${columnShower(query, error.offset)}`
            + `\n\t${error.message}`
        }
      }
    }
    currentIndex++
  }
  console.debug("selected queries:", selectedQueries);
  if (selectedQueries.length === 0) {
    throw {
      query: queries[baseIndex],
      displayMessage: `Empty query for base query at line ${baseIndex + 1}\n -${queries[baseIndex]}`
    }
  }

  let [base, ...sub] = selectedQueries
  if (VENN_REGEXP.test(base)) {
    const venned = venn(base);
    const leftReplaced = replaceUse(queryEnv.aliases, queryEnv.defaultDomain ? `${queryEnv.defaultDomain} (${venned.left})` : venned.left);
    const rightReplaced = replaceUse(queryEnv.aliases, queryEnv.defaultDomain ? `${queryEnv.defaultDomain} (${venned.right})` : venned.right);
    return {
      rawQueries: selectedQueries,
      strategy: RunStrategy.Venn,
      queries: [leftReplaced, rightReplaced, ...sub],
      injectPrefix: ()=>"",
      getWeight: weightAlgorithms[queryEnv.defaultWeight],
    }
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

  return {
    rawQueries: selectedQueries,
    strategy: RunStrategy.Search,
    queries: sub,
    injectPrefix: prefixFunc,
    getWeight: weightAlgorithms[queryEnv.defaultWeight],
  }
}