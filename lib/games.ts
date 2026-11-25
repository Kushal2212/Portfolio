export type MemoryPair = { name: string; note: string };
export type MemoryCard = MemoryPair & { id: string };

/**
 * Cards for the memory game. Real projects come from the database; the rest of
 * the deck is filled with tools from the stack so the board always has enough
 * pairs to be interesting.
 */
export const stackPairs: MemoryPair[] = [
  {
    name: "Next.js",
    note: "App Router, server components and the fetch cache — most of this site.",
  },
  {
    name: "TypeScript",
    note: "Types on the API, the queries and every component in between.",
  },
  {
    name: "PostgreSQL",
    note: "Relational data with careful indexes; the boring reliability I like.",
  },
  {
    name: "Prisma",
    note: "Typed queries and migrations that stay readable six months later.",
  },
  {
    name: "Python",
    note: "Flask, OpenCV and a cardamom leaf classifier that started as coursework.",
  },
  {
    name: "Docker",
    note: "Reproducible environments, from the laptop to the server.",
  },
];

/** Keeps the board playable if the project table is empty or unreachable. */
export const fallbackPairs: MemoryPair[] = [
  {
    name: "Design systems",
    note: "The same spacing, type and colour tokens across every page.",
  },
  {
    name: "Performance",
    note: "Static pages, small bundles and images that load when they are needed.",
  },
];

export const PAIRS_PER_BOARD = 6;

export function shuffle<T>(input: T[]): T[] {
  const list = [...input];
  for (let i = list.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [list[i], list[j]] = [list[j], list[i]];
  }
  return list;
}

/**
 * Builds a shuffled 12-card board from up to six unique pairs. IDs are stable
 * per card so React keys and comparisons stay simple.
 */
export function buildMemoryDeck(pairs: MemoryPair[]): MemoryCard[] {
  const seen = new Set<string>();
  const unique: MemoryPair[] = [];

  for (const pair of [...pairs, ...stackPairs]) {
    if (!pair.name || seen.has(pair.name)) continue;
    seen.add(pair.name);
    unique.push(pair);
    if (unique.length === PAIRS_PER_BOARD) break;
  }

  return shuffle(unique.flatMap((pair, index) => [
    { ...pair, id: `${index}-a` },
    { ...pair, id: `${index}-b` },
  ]));
}

/**
 * Board for the project deck: real projects first, fallbacks only when there
 * are fewer than two, so the game always has something to pair.
 */
export function buildProjectDeck(projects: MemoryPair[]): MemoryCard[] {
  return buildMemoryDeck(projects.length >= 2 ? projects : [...projects, ...fallbackPairs]);
}
