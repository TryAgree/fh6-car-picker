import { describe, expect, it, vi } from "vitest";
import { buildCars, buildRecommendations, mapDiscipline, slugify, splitSources } from "./transform";
import type { SeedCarEntry } from "./transform";

describe("slugify", () => {
  it("lowercases and hyphenates", () => {
    expect(slugify("Ford F-450 (Super Duty)")).toBe("ford-f-450-super-duty");
  });

  it("strips apostrophes without leaving a stray hyphen", () => {
    expect(slugify("Nissan GT-R Black Edition (R35) 'Forza Edition'")).toBe(
      "nissan-gt-r-black-edition-r35-forza-edition",
    );
  });
});

describe("mapDiscipline", () => {
  it("splits the merged Road & Street label into both target disciplines", () => {
    expect(mapDiscipline("Road & Street")).toEqual(["road", "street"]);
  });

  it("maps the remaining labels 1:1", () => {
    expect(mapDiscipline("Drift")).toEqual(["drift"]);
    expect(mapDiscipline("Dirt & Rally")).toEqual(["dirt"]);
    expect(mapDiscipline("Cross-Country")).toEqual(["xc"]);
    expect(mapDiscipline("Drag & Top Speed")).toEqual(["drag"]);
  });

  it("throws on an unrecognized label instead of silently dropping data", () => {
    expect(() => mapDiscipline("Touge")).toThrow();
  });
});

describe("splitSources", () => {
  it("splits comma-joined citations into trimmed SourceRef objects", () => {
    expect(splitSources("Game8, PC Gamer")).toEqual([{ name: "Game8" }, { name: "PC Gamer" }]);
  });

  it("handles a single citation", () => {
    expect(splitSources("gamingpromax")).toEqual([{ name: "gamingpromax" }]);
  });
});

function entry(overrides: Partial<SeedCarEntry>): SeedCarEntry {
  return {
    discipline: "Cross-Country",
    car_class: "D",
    rank: 1,
    year: null,
    name: "Test Car",
    price_cr: null,
    acquisition: "Autoshow",
    confidence: "Strong",
    strengths: "Good",
    weaknesses: "Bad",
    sources: "Game8",
    ...overrides,
  };
}

describe("buildCars", () => {
  it("merges same-named cars across classes into one Car with unioned classes", () => {
    const cars = buildCars([
      entry({ name: "Ford F-450 (Super Duty)", car_class: "D" }),
      entry({ name: "Ford F-450 (Super Duty)", car_class: "C" }),
      entry({ name: "Ford F-450 (Super Duty)", car_class: "B" }),
    ]);
    expect(cars).toHaveLength(1);
    expect(cars[0].classes).toEqual(["D", "C", "B"]);
  });

  it("merges same-named cars across disciplines", () => {
    const cars = buildCars([
      entry({ discipline: "Dirt & Rally", name: "Subaru BRZ 'Forza Edition'", car_class: "A" }),
      entry({ discipline: "Cross-Country", name: "Subaru BRZ 'Forza Edition'", car_class: "S1" }),
    ]);
    expect(cars).toHaveLength(1);
    expect(cars[0].classes).toEqual(["A", "S1"]);
  });

  it("warns and keeps the original year on conflict instead of silently overwriting", () => {
    const warn = vi.fn();
    const cars = buildCars(
      [entry({ name: "X", year: 2000 }), entry({ name: "X", year: 2001 })],
      warn,
    );
    expect(cars[0].year).toBe(2000);
    expect(warn).toHaveBeenCalledOnce();
  });
});

describe("buildRecommendations", () => {
  it("produces two rows for a Road & Street entry, both flagged as derived", () => {
    const recs = buildRecommendations(
      [entry({ discipline: "Road & Street", name: "Toyota GR Supra" })],
      [],
      {},
      "2026-06-05",
    );
    expect(recs).toHaveLength(2);
    expect(recs.map((r) => r.discipline).sort()).toEqual(["road", "street"]);
    for (const rec of recs) {
      expect(rec.derived?.reason).toBe("road-street-merged");
    }
  });

  it("produces one row for a non-merged discipline with no derived flag", () => {
    const recs = buildRecommendations(
      [entry({ discipline: "Drift", name: "Nissan Silvia K's (S14)" })],
      [],
      {},
      "2026-06-05",
    );
    expect(recs).toHaveLength(1);
    expect(recs[0].derived).toBeUndefined();
  });

  it("prefers a matched tuneCode over tuneSearchHint", () => {
    const recs = buildRecommendations(
      [entry({ discipline: "Drift", name: "1962 Peel P50" })],
      [{ car: "1962 Peel P50", pi: "D 100", code: "531 816 165", best_for: "x", source: "Dexerto" }],
      { Drift: "some hint" },
      "2026-06-05",
    );
    expect(recs[0].tuneCode).toBe("531 816 165");
    expect(recs[0].tuneSearchHint).toBeUndefined();
  });

  it("falls back to tuneSearchHint when there is no matching tune code", () => {
    const recs = buildRecommendations(
      [entry({ discipline: "Drift", name: "Unmatched Car" })],
      [],
      { Drift: "search hint text" },
      "2026-06-05",
    );
    expect(recs[0].tuneCode).toBeUndefined();
    expect(recs[0].tuneSearchHint).toBe("search hint text");
  });
});
