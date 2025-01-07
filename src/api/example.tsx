import React from 'react'

export interface QueryExample {
  title: string
  description?: React.ReactNode
  queries: string[]
}

export const SAVAI_SACRIFICE_EXAMPLE: QueryExample = {
  title: 'savai sacrifice',
  queries: [
    '-is:extra ci:savai o:/sacrifice an? *./',
    '# good sacrifice payoffs',
    'o:/draw .* cards?/',
    'o:/deals? .* damage/',
    'o:/loses? .* life/',
    'o:/gains? .* life/',
    'o:scry or kw:"surveil"',
    't:creature',
    '-t:planeswalker -t:creature',
    "# subquery 8 is a fallback query",
    '*',
    "# A fallback query is any query that overlaps with the base query.",
    "# Use a fallback query to include the entire base domain in the search results.",
    "# *, the identity filter that matches all cards, is the most concise way to do this"
  ],
}

export const KNIGHTS_EXAMPLE: QueryExample = {
    title: 'savai knights matters, centered in white',
    queries: ['o:knight ci:brw', 't:knight', 'ci=bw or ci=rw', 'ci=br', 'ci:brw'],
  }

export const INTRO_EXAMPLE: string[] = [
  "# Each paragraph is its own query set. Comments start with #",
  "",
  "# Single queries work great in their own paragraph!",
  "# Press ▶️ next to the next line to run the query.",
  "t:land o:sacrifice",
  "",
  "# A query set with multiple queries uses the base/sub model.",
  "# The base query is the domain for all subqueries.",
  SAVAI_SACRIFICE_EXAMPLE.queries[0],
  "# Each subquery is weighted by its rank and ",
  "# contribute to the result ordering.",
  ...SAVAI_SACRIFICE_EXAMPLE.queries.slice(1),
  "",
  `# See the "about me" and "user guide" pages for more info`
]
