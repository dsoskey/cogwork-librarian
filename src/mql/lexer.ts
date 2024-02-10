import moo from 'moo'
import { FILTER_KEYWORDS } from './types/filterKeyword'

const KEYWORDS_BY_LENGTH = Object.values(FILTER_KEYWORDS).sort((a, b) => b.length - a.length)

const caseInsensitiveKeywords = map => {
  const transform = moo.keywords(map)
  return text => transform(text.toLowerCase())
}

export const lexer = moo.states({
  main: {
    ws: /[ \t]+/,
    operator: [":","=","!=","<>","<=","<",">=",">"],
    negate: "-",
    art: "@@",
    prints: "++",
    decimal: { match: /[0-9]*\.[0-9]+/, value: s => Number.parseFloat(s) },
    integer: { match:/[0-9]+/, value: s => Number.parseInt(s, 10) },
    lparen: "(",
    rparen: ")",
    lbrace: { match: "{", push: "manasymbol" },
    bang: "!",
    regex: { match: /\/(?:\\[\/\\a-zA-Z]|[^\n\/\\])*\//, value: s =>s.slice(1, -1) },
    dqstring: { match: /"(?:\\["\\]|[^\n"\\])*"/, value: s => s.slice(1, -1) },
    sqstring: { match: /'(?:\\['\\]|[^\n'\\])*'/, value: s => s.slice(1, -1) },
    word: { match: /[a-zA-z\-]+/, type: caseInsensitiveKeywords({
        bool: ["and", "or"],
        filter: KEYWORDS_BY_LENGTH
      }) },
  },
  manasymbol: {
    rbrace: { match: "}", pop: 1},
    number: /[0-9]+/,
    color: /[xyzwubrgsc]/,
    slash: "/",
  }
})

export const states = moo.states({
  main: {

    bool: ["and", "or"],
    filter: { match: KEYWORDS_BY_LENGTH, push:"maybefilter" },
  },
  maybefilter: {
    ws: { match: /[ \t]+/, pop: 1 },
    operator: { match: [":","=","!=","<>","<=","<",">=",">"], push: "filtervalue" }
  },
  filtervalue: {

  }
})