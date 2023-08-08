import { queryExamples } from '../../api/example'

export const INTRO_EXAMPLE: string[] = [
  "# Each paragraph is its own query set. Comments start with #",
  "",
  "# Single queries work great in their own paragraph!",
  "# Press ▶️ next to the next line to run the query",
  "t:land o:sacrifice",
  "",
  "# A query set with multiple queries uses the base/sub model",
  "# The base query becomes the domain for all subqueries",
  queryExamples[2].prefix,
  "# Each subquery is weighted by its rank and ",
  "# contribute to the result ordering",
  ...queryExamples[2].queries,
  "",
  `# See "about me" and "syntax guide" for more info`
]