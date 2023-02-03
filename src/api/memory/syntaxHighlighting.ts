import 'prismjs/components/prism-regex.js'
import Prism, { Grammar } from 'prismjs'

export type Language = 'regex' | 'scryfall' | 'scryfall-extended'
const keywords =
  'keyword|manavalue|mv|cmc|name|color|ci|c|id|identity|oracle|o|text|type|power|pow|toughness|tou|loyalty|loy|layout|is|t'
const keywordsToImplement =
  'fo|mana|devotion|produces|powtou|pt|rarity|r|include|set|edition|s|e|in|number|cn|st|cube|banned|restricted|usd|eur|tix|' +
  'artist|a|has|watermark|wm|flavor|format|ft|f|border|stamp|year|date|art|atag|arttag|function|otag|oracletag|not|language|lang|' +
  'unique|order|direction|prefer'
console.debug(
  `${keywordsToImplement.split('|').length} keywords to add to local syntax`
)
const operators = ':|=|!=|<>|<=|<|>=|>'

// Anything defined by scryfall itself goes here
// todo: parentheses
export const scryfall: Grammar = {
  negation: {
    pattern: new RegExp(`-(${keywords})(?=(${operators}))`, 'i'),
    alias: 'deleted',
    greedy: true,
  },
  'not-local-negation': {
    pattern: new RegExp(`-(${keywordsToImplement})(?=(${operators}))`, 'i'),
    alias: ['deleted', 'limited'],
    greedy: true,
  },
  keyword: {
    pattern: new RegExp(`(^|\\b)(${keywords})(?=(${operators}))`, 'i'),
  },
  'not-local-keyword': {
    pattern: new RegExp(
      `(^|\\b)(${keywordsToImplement})(?=(${operators}))`,
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
