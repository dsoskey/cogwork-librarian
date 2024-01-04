import React from 'react'

export interface QueryExample {
  title: string
  description?: React.ReactNode
  queries: string[]
  prefix: string
}

const SAVAI_SACRIFICE_EXAMPLE: QueryExample = {
  title: 'savai sacrifice',
  prefix: '-is:extra ci:savai o:/sacrifice an? *./',
  queries: [
    'o:/draw .* cards?/',
    'o:/deals? .* damage/',
    'o:/loses? .* life/',
    'o:/gains? .* life/',
    'o:/scry/',
    't:creature',
    '-t:planeswalker -t:creature',
    'ci:savai',
  ],
}

export const KNIGHTS_EXAMPLE: QueryExample = {
    title: 'savai knights matters, centered in white',
    prefix: 'o:knight ci:brw',
    queries: ['t:knight', 'ci=bw or ci=rw', 'ci=br', 'ci:brw'],
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
  SAVAI_SACRIFICE_EXAMPLE.prefix,
  "# Each subquery is weighted by its rank and ",
  "# contribute to the result ordering.",
  ...SAVAI_SACRIFICE_EXAMPLE.queries,
  "",
  `# See the "about me" and "user guide" pages for more info`
]

export const ALIAS_EXAMPLE: string[] = [
  "# Aliases let you define a query once and use it in other query sets",
  "# Define aliases in their own paragraph in the format `@alias:NAME(QUERY)`",
  "# Press ▶️ next to the alias definition to run it as its own query",
  "@alias:innistrad(s:vow or s:mid or s:ema or s:soi or s:avr or s:dka or s:isd unique:cards)",
  "",
  "@alias:importantTypes(t:zombie or t:spirit or t:human or t:vampire or t:werewolf)",
  "",
  "# The @use extension tells cogwork librarian where to add the alias of a matching name",
  "@use:innistrad",
  "o:graveyard",
  "o:mill",
  "o:flashback",
  "o:create",
  "@use:importantTypes",
  "",
  "# This becomes much more powerful when reusing the same alias in multiple query sets",
  "@use:innistrad t:land",
  "",
  "@use:importantTypes o:/other .* you control/"
]

export const VENN_EXAMPLE: string[] = [
  "# Use a venn diagram search to show the similarities and differences of two base queries.",
  "# Format: @venn(<LEFT_QUERY>)(<RIGHT_QUERY>)",
  "@venn(t:creature)(t:artifact)",
  "# You can filter the base domains further, just like any other query set.",
  `o:"+1/+1 counter"`,
  "ci:gw c>0",
  "",
  "# This is especially helpful for comparing cube lists.",
  "# See the 'data' tab to manage your cube lists.",
  "@venn(cube:soskgy)(cube:blue-cube)",
]

export const INCLUDE_EXAMPLE = {
  title: "Bar cube",
  prefix: "# cogwork librarian offers several pre-built aliases for convenience",
  queries: [
    "# enable them by adding `@include:stdlib` on its own paragraph",
    "@include:stdlib",
    "",
    "# bar is one of them. it searches for cards that fit the",
    "# Bar Cube brewer's guide",
    "@u:bar",
    "o<=10",
    "usd<1 o<=20",
  ]
}

export const queryExamples: QueryExample[] = [
  KNIGHTS_EXAMPLE,
  {
    title: 'ketria spellslinger',
    prefix: 'c<=urg o:/(?<!(only as an? ))(instant|sorcery)/ -o:flash',
    queries: [
      't:instant',
      't:creature',
      't:enchantment',
      't:artifact',
      't:sorcery',
      'c>=ur',
      'c>=rg',
      'c>=gu',
    ],
  },
  INCLUDE_EXAMPLE,
  SAVAI_SACRIFICE_EXAMPLE,
  {
    title: 'generic planeswalker reanimation',
    description: (
      <>
        in the base query, use <code className='language-regex'>.*</code> to
        match for any text in the reanimation ability. the subqueries filter out
        most reanimation spells whose text doesn't mention planeswalkers or
        permanents. this query is easier to assemble than one that accounts for
        all reanimation variants in the regex, and it still filters out ~80% of
        the cards of the base query (385 {'-->'} 47 pre-ONE)
      </>
    ),
    prefix: 'o:/return .* from (your|a) graveyard to the battlefield/',
    queries: ['o:planeswalker', 'o:permanent'],
  },
  {
    title: 'non-red poison-matters in an artifact-matters environment',
    description: (
      <>
        this query uses a full oracle text search (
        <code className='language-scryfall'>fo:</code>), which includes reminder
        text. this ensures toxic, proliferate, and infect are included in the
        base query
      </>
    ),
    prefix: 'fo:counter ci:bwug',
    queries: ['o:toxic', 'o:proliferate', 'o:infect', 't:artifact'],
  },
  {
    title: 'blending morph into blink',
    description: (
      <>
        this query shows how comments work. as written, this ignores the morph
        subquery. remove the{' '}
        <code className='language-scryfall-extended'>#</code>{" "}
        from the first query to include them at the front of the search. the two
        blink queries are separated to rank immediate blinks from end of turn
        blinks.
      </>
    ),
    prefix: 'ci:wurg',
    queries: [
      '# o:morph or o:manifest',
      'o:/exile .* creature .*, then return (it|that card) to the battlefield/',
      'o:/exile .* creature. return (it|that card) to the battlefield/',
      'o:/when ~ enters the battlefield/',
    ],
  },
]
