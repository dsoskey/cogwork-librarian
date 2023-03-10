import React from 'react'
import Prism, { Environment, Grammar } from 'prismjs'
import 'prismjs/components/prism-regex.js'
import { keywords, keywordsToImplement, syntaxDocs } from './syntaxDocs'
import { OPERATORS } from './oracleFilter'

export type Language = 'regex' | 'scryfall' | 'scryfall-extended'
const keywordRegex = Object.values(keywords).join('|')
const toImplementRegex = Object.values(keywordsToImplement).join('|')

console.debug(
  `${Object.values(keywordsToImplement).length} keywords to add to local syntax`
)
const operators = Object.values(OPERATORS).join('|')

// Anything defined by scryfall itself goes here
export const scryfall: Grammar = {
  negation: {
    pattern: new RegExp(`-(${keywordRegex})(?=(${operators}))`, 'i'),
    alias: 'deleted',
    greedy: true,
  },
  'not-local-negation': {
    pattern: new RegExp(`-(${toImplementRegex})(?=(${operators}))`, 'i'),
    alias: ['deleted', 'limited'],
    greedy: true,
  },
  keyword: {
    pattern: new RegExp(`(^|\\b)(${keywordRegex})(?=(${operators}))`, 'i'),
  },
  'not-local-keyword': {
    pattern: new RegExp(
      `(^|\\b)(${toImplementRegex})(?=(${operators}))`,
      'i'
    ),
    alias: ['keyword', 'limited'],
  },
  'unrecognized-keyword': {
    pattern: new RegExp(`(^|\\b)(\\w+)(?=(${operators}))`, 'i'),
    alias: ['keyword', 'important'],
  },
  operator: {
    pattern: new RegExp(`\\(|\\)|${operators}|(\\b(and|or)\\b)`, 'i'),
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
    pattern: /\/[^/]+\//,
    inside: Prism.languages.regex,
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
  comment: {
    pattern: /(^|\n)\s*#.*/,
  },
  ...scryfall,
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
