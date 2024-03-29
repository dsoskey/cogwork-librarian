import React from 'react'
import Prism, { Environment, Grammar } from 'prismjs'
import 'prismjs/components/prism-regex.js'
import { FILTER_KEYWORDS, KEYWORDS_TO_IMPLEMENT, OPERATORS } from 'mtgql'
import { syntaxDocs } from './syntaxDocs'

export type Language = 'regex' | 'scryfall' | 'scryfall-extended' | 'scryfall-extended-multi'
const keywordRegex = Object.values(FILTER_KEYWORDS).join('|')

console.debug(`local supports ${Object.values(FILTER_KEYWORDS).length} keywords`)
console.debug(
  `${Object.values(KEYWORDS_TO_IMPLEMENT).length} keywords to add to local syntax`
)
const operators = Object.values(OPERATORS).join('|')

const scryfallRegex = {
  scryfallCharSet: {
    pattern: /\\(spt|spp|smh|smp|smm|smr|sm|sc|ss)/,
    alias: 'class-name',
  },
  ...Prism.languages.regex,
}

// Anything defined by scryfall itself goes here
export const scryfall: Grammar = {
  negation: {
    pattern: new RegExp(`-(${keywordRegex})(?=(${operators}))`, 'i'),
    alias: 'deleted',
    greedy: true,
  },
  keyword: {
    pattern: new RegExp(`(^|\\b)(${keywordRegex})(?=(${operators}))`, 'i'),
  },
  use: {
    pattern: /(^|\s|)@(use|u):\w+(?=( |\)|\n|$))/,
    alias: 'extension',
  },
  'unrecognized-keyword': {
    pattern: new RegExp(`(^|\\b)(\\w+)(?=(${operators}))`, 'i'),
    alias: ['keyword', 'important'],
  },
  operator: {
    pattern: new RegExp(`\\(|\\)|${operators}|(\\b(and|or)\\b)|\\+\\+|@@`, 'i'),
  },
  manaCost: {
    pattern: /\{..?(\/.)?}/,
    alias: 'string',
    inside: {
      white: {
        pattern: /w/i,
      },
      blue: {
        pattern: /u/i,
      },
      black: {
        pattern: /b/i,
      },
      red: {
        pattern: /r/i,
      },
      green: {
        pattern: /g/i,
      },
      generic: {
        pattern: /\d+|x|y|z|\{|}|\//,
      },
    },
  },
  regex: {
    pattern: /\/(\\\/|[^/])+\//,
    inside: scryfallRegex,
    greedy: true,
  },
  'quoted-string': {
    pattern: /("[^"]*"|'[^']*')/,
    greedy: true,
    alias: 'function',
  },
  'unbalanced-string': {
    pattern: /('.*"|".*')/,
    greedy: true,
    alias: ['function', 'important'],
  },
  string: {
    pattern: new RegExp(`[^\\s#]+(?=(\\b|$))`),
  },
}

// Anything built on top of scryfall goes here
export const scryfallExtended: Grammar = {
  'invalid-comment': {
    pattern: /^#.+/,
    alias: ['keyword', 'important'],
  },
  comment: {
    pattern: /\n\s*#.*/,
  },
  'sub-query': {
    pattern: /\n.*/,
    inside: scryfall,
    alias: ['sub-query'],
  },
  'base-query': {
    pattern: /.*/,
    inside: scryfall,
    alias: ['main-query'],
  },
}

export const scryfallExtendedMulti: Grammar = {
  comment: {
    pattern: /(\n|^)\s*#.*(?=\n|$)/,
    // greedy: true,
  },
  extension: {
    // pattern: /(\n|^)\s*#.*(?=\n|$)/,
    pattern: /@(include|i|defaultMode|dm|defaultWeight|dw|alias|a):\w+/
  },
  venn: {
    pattern: /@(venn|v)/,
    alias: ["extension"]
  },
  // 'base-query': {
  //   // pattern: /(?:^|\n\n+|(\n|^)\s*#.*(\n|$))(?!\s*#).*(\n|$)/,
  //   pattern: /(^|\n\n+)(?!\s*#).*(?=\n|$)/,
  //   inside: scryfall,
  //   alias: ['main-query'],
  //   // lookbehind: true,
  //   greedy: true,
  // },
  'sub-query': {
    pattern: /.*(\n|$)/,
    inside: scryfall,
    alias: ['sub-query'],
  },
}

export const linkWrap = (env: Environment) => {
  if (/(^|(local-))keyword/.test(env.type)) {
    env.tag = 'a'

    env.attributes.href = syntaxDocs[env.content]

    env.attributes.target = '_blank'

    env.attributes.rel = 'noreferrer noopener'
  }
}

export const useHighlightPrism = (deps: any[]) => {
  React.useLayoutEffect(() => {
    Prism.highlightAll()
  }, deps)
}
