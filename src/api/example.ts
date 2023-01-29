import { QueryFormFields } from '../ui/queryForm/useQueryForm'

interface QueryExample extends QueryFormFields {
  title: string
}

export const queryExamples: QueryExample[] = [
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
    options: {},
  },
  {
    title: 'savai sacrifice',
    prefix: '-t:vanguard ci:rwb o:/sacrifice an? *./',
    queries: [
      "o:/draw .* cards?/",
      "o:/deals? .* damage/",
      "o:/loses? .* life/",
      "o:/gains? .* life/",
      "o:/scry/",
      "t:creature",
      "-t:planeswalker -t:creature",
      "ci:brw",
    ],
    options: {},
  },
  // {
  //   title: 'modifying creatures',
  //
  // }
  {
    title: 'savai knights matters, centered in white',
    prefix: 'o:knight ci:brw',
    queries: ['t:knight', 'ci=bw or ci=rw', 'ci=br', 'ci:brw'],
    options: {},
  },
]
