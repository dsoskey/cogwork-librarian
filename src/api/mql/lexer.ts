import moo from 'moo'
import { keywords } from './types/filterKeyword'
const bread = Object.values(keywords).sort((a, b) => b.length - a.length)
// console.log(bread)

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
    integer: /[0-9]+/,
    decimal: /[0-9]*\.[0-9]+/,
    lparen: "(",
    rparen: ")",
    lbrace: { match: "{", push: "manasymbol" },
    bang: "!",
    regex: { match: /\/(?:\\[\/\\a-zA-Z]|[^\n\/\\])*\//, value: s =>s.slice(1, -1) },
    dqstring: { match: /"(?:\\["\\]|[^\n"\\])*"/, value: s => s.slice(1, -1) },
    sqstring: { match: /'(?:\\['\\]|[^\n'\\])*'/, value: s => s.slice(1, -1) },
    word: { match: /[a-zA-z\-]+/, type: caseInsensitiveKeywords({
        bool: ["and", "or"],
        filter: bread
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
    filter: { match: bread, push:"maybefilter" },
  },
  maybefilter: {
    ws: { match: /[ \t]+/, pop: 1 },
    operator: { match: [":","=","!=","<>","<=","<",">=",">"], push: "filtervalue" }
  },
  filtervalue: {

  }
})