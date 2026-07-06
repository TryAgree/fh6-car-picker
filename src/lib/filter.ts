import type { Class, Discipline, Recommendation } from "../types";

export function filterRecommendations(
  recs: Recommendation[],
  discipline: Discipline,
  klass: Class,
): Recommendation[] {
  return recs
    .filter((r) => r.discipline === discipline && r.class === klass)
    .sort((a, b) => a.rank - b.rank);
}

export type Selection =
  | { kind: "idle" }
  | { kind: "discipline-empty"; discipline: Discipline }
  | { kind: "combo-empty"; discipline: Discipline; klass: Class }
  | { kind: "results"; items: Recommendation[] };

export function classifySelection(
  recs: Recommendation[],
  discipline: Discipline | undefined,
  klass: Class | undefined,
): Selection {
  if (!discipline || !klass) {
    return { kind: "idle" };
  }

  const disciplineHasAnyData = recs.some((r) => r.discipline === discipline);
  if (!disciplineHasAnyData) {
    return { kind: "discipline-empty", discipline };
  }

  const items = filterRecommendations(recs, discipline, klass);
  if (items.length === 0) {
    return { kind: "combo-empty", discipline, klass };
  }

  return { kind: "results", items };
}

const SIXTY_DAYS_MS = 60 * 24 * 60 * 60 * 1000;

export function isStale(updatedAt: string, now: Date): boolean {
  const updated = new Date(updatedAt).getTime();
  return now.getTime() - updated > SIXTY_DAYS_MS;
}
