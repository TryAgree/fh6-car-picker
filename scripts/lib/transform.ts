import type { Car, Class, Confidence, Discipline, Recommendation, SourceRef } from "../../src/types";

export interface SeedCarEntry {
  discipline: string;
  car_class: string;
  rank: number;
  year: number | null;
  name: string;
  price_cr: number | null;
  acquisition: string;
  confidence: string;
  strengths: string;
  weaknesses: string;
  sources: string;
}

export interface SeedTuneCode {
  car: string;
  pi: string;
  code: string;
  best_for: string;
  source: string;
}

export type SeedCodeSources = Record<string, string>;

const COMBINING_DIACRITICS = /[̀-ͯ]/g;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS, "")
    .replace(/'/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Source data lumps road+street into one label. Everything else maps 1:1.
 * There is no source label for `touge` — it intentionally produces no rows.
 */
export function mapDiscipline(sourceLabel: string): Discipline[] {
  const map: Record<string, Discipline[]> = {
    "Road & Street": ["road", "street"],
    "Drag & Top Speed": ["drag"],
    Drift: ["drift"],
    "Dirt & Rally": ["dirt"],
    "Cross-Country": ["xc"],
  };
  const mapped = map[sourceLabel];
  if (!mapped) {
    throw new Error(`Unknown source discipline label: "${sourceLabel}"`);
  }
  return mapped;
}

export function splitSources(raw: string): SourceRef[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0)
    .map((name) => ({ name }));
}

interface CarAccumulator {
  name: string;
  year?: number;
  classes: Set<Class>;
}

export function buildCars(entries: SeedCarEntry[], warn: (msg: string) => void = console.warn): Car[] {
  const byName = new Map<string, CarAccumulator>();

  for (const entry of entries) {
    const existing = byName.get(entry.name);
    const carClass = entry.car_class as Class;
    if (existing) {
      existing.classes.add(carClass);
      if (entry.year != null && existing.year != null && existing.year !== entry.year) {
        warn(
          `Car "${entry.name}": conflicting year ${entry.year} vs existing ${existing.year} — keeping ${existing.year}`,
        );
      } else if (existing.year == null && entry.year != null) {
        existing.year = entry.year;
      }
    } else {
      byName.set(entry.name, {
        name: entry.name,
        year: entry.year ?? undefined,
        classes: new Set([carClass]),
      });
    }
  }

  return Array.from(byName.values()).map((acc) => ({
    id: slugify(acc.name),
    name: acc.name,
    year: acc.year,
    classes: Array.from(acc.classes),
  }));
}

export function buildRecommendations(
  entries: SeedCarEntry[],
  tuneCodes: SeedTuneCode[],
  codeSources: SeedCodeSources,
  updatedAt: string,
): Recommendation[] {
  const tuneCodeByCarName = new Map(tuneCodes.map((t) => [t.car, t.code]));

  const recommendations: Recommendation[] = [];

  for (const entry of entries) {
    const disciplines = mapDiscipline(entry.discipline);
    const isMerged = disciplines.length > 1;

    for (const discipline of disciplines) {
      const tuneCode = tuneCodeByCarName.get(entry.name);
      const recommendation: Recommendation = {
        discipline,
        class: entry.car_class as Class,
        rank: entry.rank,
        carId: slugify(entry.name),
        source: splitSources(entry.sources),
        updatedAt,
        confidence: entry.confidence as Confidence,
        acquisition: entry.acquisition,
        strengths: [entry.strengths],
        weaknesses: [entry.weaknesses],
      };
      if (tuneCode) {
        recommendation.tuneCode = tuneCode;
      } else {
        const hint = codeSources[entry.discipline];
        if (hint) recommendation.tuneSearchHint = hint;
      }
      if (entry.price_cr != null) recommendation.priceCr = entry.price_cr;
      if (isMerged) {
        recommendation.derived = {
          reason: "road-street-merged",
          note: "來源未區分 road/street,兩者推薦內容相同",
        };
      }
      recommendations.push(recommendation);
    }
  }

  return recommendations;
}
