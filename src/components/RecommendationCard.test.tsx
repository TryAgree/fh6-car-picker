import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RecommendationCard } from "./RecommendationCard";
import type { Recommendation } from "../types";

function makeRecommendation(overrides: Partial<Recommendation> = {}): Recommendation {
  return {
    discipline: "drift",
    class: "B",
    rank: 1,
    carId: "unknown-car",
    source: [{ name: "Game8" }],
    updatedAt: "2026-06-05",
    ...overrides,
  };
}

describe("RecommendationCard", () => {
  it("shows a copy button that switches to a confirmation after copying", async () => {
    const user = userEvent.setup();
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: vi.fn().mockResolvedValue(undefined) },
      configurable: true,
    });
    render(<RecommendationCard recommendation={makeRecommendation({ tuneCode: "531 816 165" })} />);

    expect(screen.getByText("531 816 165")).toBeInTheDocument();
    const button = screen.getByRole("button", { name: "複製" });
    await user.click(button);

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("531 816 165");
    expect(await screen.findByRole("button", { name: "已複製 ✓" })).toBeInTheDocument();
  });

  it("shows tuneSearchHint instead of a copy button when there is no tuneCode", () => {
    render(
      <RecommendationCard recommendation={makeRecommendation({ tuneSearchHint: "search the marketplace" })} />,
    );
    expect(screen.queryByRole("button", { name: "複製" })).not.toBeInTheDocument();
    expect(screen.getByText(/search the marketplace/)).toBeInTheDocument();
  });

  it("falls back to generic in-game guidance when neither tuneCode nor tuneSearchHint exists", () => {
    render(<RecommendationCard recommendation={makeRecommendation()} />);
    expect(screen.queryByRole("button", { name: "複製" })).not.toBeInTheDocument();
    expect(screen.getByText(/Upgrade and Tune/)).toBeInTheDocument();
  });

  it("shows the derived note when present", () => {
    render(
      <RecommendationCard
        recommendation={makeRecommendation({
          derived: { reason: "road-street-merged", note: "來源未區分 road/street" },
        })}
      />,
    );
    expect(screen.getByText(/來源未區分 road\/street/)).toBeInTheDocument();
  });

  it("does not show a stale badge for a recent update", () => {
    const recent = new Date().toISOString().slice(0, 10);
    render(<RecommendationCard recommendation={makeRecommendation({ updatedAt: recent })} />);
    expect(screen.queryByText("可能過時")).not.toBeInTheDocument();
  });

  it("shows a stale badge for an update older than 60 days", () => {
    render(<RecommendationCard recommendation={makeRecommendation({ updatedAt: "2020-01-01" })} />);
    expect(screen.getByText("可能過時")).toBeInTheDocument();
  });
});
