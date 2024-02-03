import { CardEntry, parseEntry, serializeEntry } from './cardEntry'
import { fromMarkdown } from 'mdast-util-from-markdown'

export interface Project {
  path: string;
  savedCards: CardEntry[];
  ignoredCards: string[];
  queries: string[];
  createdAt: Date;
  updatedAt: Date;
}

const CARD_PREFIX = "```cards\n"
const QUERY_PREFIX = "```queries\n"

export function serializeProject(project: Project): string {
  const path = `# ${project.path}`
  const cards = `${CARD_PREFIX}${project.savedCards.map(serializeEntry).join('\n')}\n\`\`\``
  const queries = `${QUERY_PREFIX}${project.queries.join('\n')}\n\`\`\``;
  return [path, queries, cards].join("\n\n");
}

export const TEST_PROJECT = `
# /path/to/project

\`\`\`cards
4 dang
11 wow
foo
2 corn
\`\`\`

\`\`\`queries
query
other query

# whoa


multiline
\`\`\`
`

export function parseProject(rawProject: string, defaultPath: string, now: Date): Project {
  const tree = fromMarkdown(rawProject);
  const rawPath = tree.children.find(i => i.type === "heading");
  const path = rawPath ? (rawPath).children[0].value : defaultPath;
  const rawCards = tree.children.find(i => i.type === "code" && i.lang === "cards");
  // @ts-ignore
  const savedCards = rawCards ? rawCards.value.split("\n").map(parseEntry) : [];
  const rawQueries = tree.children.find(i => i.type === "code" && i.lang === "queries");
  // @ts-ignore
  const queries = rawQueries ? rawQueries.value.split("\n") : [];
  return { path, savedCards, queries, ignoredCards: [], createdAt: now, updatedAt: now };
}