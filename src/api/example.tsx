import React from 'react'
import { QueryFormFields } from '../ui/queryForm/useQueryForm'

export interface QueryExample extends Omit<QueryFormFields, 'options'> {
  title: string
  description?: React.ReactNode
}

export const queryExamples: QueryExample[] = [
  {
    title: 'savai knights matters, centered in white',
    prefix: 'o:knight ci:brw',
    queries: ['t:knight', 'ci=bw or ci=rw', 'ci=br', 'ci:brw'],
  },
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
  {
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
  },
  // {
  //   title: 'modifying creatures',
  //
  // }
  {
    title: 'generic planeswalker reanimation',
    description: (
      <>
        in the main query, use <code className='language-regex'>.*</code> to
        match for any text in the reanimation ability. the subqueries filter out
        most reanimation spells whose text doesn't mention planeswalkers or
        permanents. this query is easier to assemble than one that accounts for
        all reanimation variants in the regex, and it still filters out ~80% of
        the cards of the main query (385 {'-->'} 47 pre-ONE)
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
        main query
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
