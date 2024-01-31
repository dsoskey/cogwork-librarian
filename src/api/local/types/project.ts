import { CardEntry, parseEntry, serializeEntry } from './cardEntry'

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

export function parseProject(rawProject: string, defaultPath: string, now: Date): Project {
  const parts = rawProject.split("\n\n");
  const rawPath = parts.find(i => i.startsWith("# "));
  const path = rawPath ? rawPath.substring(2) : defaultPath;
  const rawCards = parts.find(i => i.startsWith("```cards\n"));
  const savedCards = rawCards
    ? rawCards
      .substring(CARD_PREFIX.length, rawCards.length - 4)
      .split("\n")
      .map(parseEntry)
    : [];
  const rawQueries = parts.find(i => i.startsWith("```queries\n"));
  const queries = rawQueries
    ? rawQueries.substring(QUERY_PREFIX.length, rawQueries.length - 4).split("\n")
    : [];
  return { path, savedCards, queries, ignoredCards: [], createdAt: now, updatedAt: now };
}