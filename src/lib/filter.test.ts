import { describe, expect, it } from "vitest";
import { classifySelection, filterRecommendations, isStale } from "./filter";
import { recommendations } from "./data";

describe("filterRecommendations", () => {
  it("filters by discipline+class and sorts by rank", () => {
    const items = filterRecommendations(recommendations, "dirt", "B");
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((i) => i.discipline === "dirt" && i.class === "B")).toBe(true);
    for (let i = 1; i < items.length; i++) {
      expect(items[i].rank).toBeGreaterThanOrEqual(items[i - 1].rank);
    }
  });
});

describe("classifySelection", () => {
  it("returns idle when discipline or class is not yet chosen", () => {
    expect(classifySelection(recommendations, undefined, "D")).toEqual({ kind: "idle" });
    expect(classifySelection(recommendations, "road", undefined)).toEqual({ kind: "idle" });
    expect(classifySelection(recommendations, undefined, undefined)).toEqual({ kind: "idle" });
  });

  it("returns discipline-empty for touge, which has zero source data", () => {
    const result = classifySelection(recommendations, "touge", "D");
    expect(result).toEqual({ kind: "discipline-empty", discipline: "touge" });
  });

  it("returns combo-empty when the discipline has data but not this class (drag has no C)", () => {
    const result = classifySelection(recommendations, "drag", "C");
    expect(result).toEqual({ kind: "combo-empty", discipline: "drag", klass: "C" });
  });

  it("returns combo-empty for class X, which no discipline has data for", () => {
    const result = classifySelection(recommendations, "dirt", "X");
    expect(result).toEqual({ kind: "combo-empty", discipline: "dirt", klass: "X" });
  });

  it("returns results with filtered+sorted items for a real combo", () => {
    const result = classifySelection(recommendations, "dirt", "B");
    expect(result.kind).toBe("results");
    if (result.kind === "results") {
      expect(result.items.length).toBeGreaterThan(0);
    }
  });
});

describe("isStale", () => {
  it("is false for a recommendation updated 10 days ago", () => {
    const now = new Date("2026-07-07T00:00:00Z");
    expect(isStale("2026-06-27", now)).toBe(false);
  });

  it("is true for a recommendation updated 90 days ago", () => {
    const now = new Date("2026-07-07T00:00:00Z");
    expect(isStale("2026-04-08", now)).toBe(true);
  });
});
