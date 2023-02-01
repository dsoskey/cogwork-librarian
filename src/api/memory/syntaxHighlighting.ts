import 'prismjs/components/prism-regex.js'
import Prism, { Grammar } from 'prismjs'

export type Language = 'regex' | 'scryfall' | 'scryfall-extended'
const keywords =
  'mv|cmc|name|color|ci|c|id|identity|oracle|o|text|type|power|pow|toughness|tou|loy|loyalty|layout|is|t'
const operators = ':|=|!=|<>|<=|<|>=|>'

// Anything defined by scryfall itself goes here
export const scryfall: Grammar = {
  negation: {
    pattern: new RegExp(`(^|\\s)-(${keywords})`),
    alias: 'deleted',
    greedy: true,
  },
  // how do we handle
  keyword: {
    pattern: new RegExp(`(^|\\b)(${keywords})(?=(${operators}))`, 'i'),
  },
  // TODO: Turn this error color on when scryfall/local parity is a little closer
  // 'unrecognized-keyword': {
  //   pattern: new RegExp(`(^|\\b)(\\w+)(?=(${operators}))`, 'i'),
  //   alias: ['keyword', 'important'],
  // },
  operator: {
    pattern: new RegExp(`${operators}|(\\b(and|or)\\b)`, 'i'),
  },
  regex: {
    pattern: /\/.*\//,
    inside: Prism.languages.regex,
    greedy: true,
  },
  'quoted-string': {
    pattern: /(".*"|'.*')/,
    greedy: true,
    alias: 'function',
  },
  'unbalanced-string': {
    pattern: /('.*"|".*')/,
    greedy: true,
    alias: ['function', 'important'],
  },
  string: {
    pattern: new RegExp(`[^\\s#]+(\\s|$)`),
  },
}

// Anything built on top of scryfall goes here
export const scryfallExtended: Grammar = {
  comment: {
    pattern: /^\s*#.*/,
    greedy: true,
  },
}
