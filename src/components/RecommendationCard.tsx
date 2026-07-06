import type { Recommendation } from "../types";
import { getCar } from "../lib/data";
import { isStale } from "../lib/filter";
import { useCopyFeedback } from "../hooks/useCopyFeedback";

export function RecommendationCard({ recommendation }: { recommendation: Recommendation }) {
  const car = getCar(recommendation.carId);
  const { copiedText, copy } = useCopyFeedback();
  const stale = isStale(recommendation.updatedAt, new Date());
  const copied = recommendation.tuneCode != null && copiedText === recommendation.tuneCode;

  return (
    <div className="rounded-lg bg-slate-900 p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-semibold">
          #{recommendation.rank} {car?.name ?? recommendation.carId}
          {car?.year && <span className="text-slate-400"> ({car.year})</span>}
        </h3>
        {recommendation.confidence && (
          <span className="shrink-0 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300">
            {recommendation.confidence}
          </span>
        )}
      </div>

      {recommendation.derived && (
        <p className="text-xs text-amber-400">⚠ {recommendation.derived.note}</p>
      )}

      {recommendation.strengths && recommendation.strengths.length > 0 && (
        <ul className="text-sm text-slate-300 list-disc list-inside">
          {recommendation.strengths.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}
      {recommendation.weaknesses && recommendation.weaknesses.length > 0 && (
        <ul className="text-sm text-slate-500 list-disc list-inside">
          {recommendation.weaknesses.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      )}

      {recommendation.seasonNotes && (
        <p className="text-sm text-slate-400">季節備註:{recommendation.seasonNotes}</p>
      )}

      {recommendation.tuneCode ? (
        <div className="flex items-center gap-2">
          <code className="rounded bg-slate-800 px-2 py-1 text-sm">{recommendation.tuneCode}</code>
          <button
            type="button"
            onClick={() => copy(recommendation.tuneCode!)}
            className="min-h-11 rounded bg-emerald-500 px-3 py-1 text-sm font-medium text-slate-950 hover:bg-emerald-400"
          >
            {copied ? "已複製 ✓" : "複製"}
          </button>
          <span aria-live="polite" className="sr-only">
            {copied ? "已複製調校代碼" : ""}
          </span>
        </div>
      ) : recommendation.tuneSearchHint ? (
        <p className="text-sm text-slate-400">調校搜尋提示:{recommendation.tuneSearchHint}</p>
      ) : (
        <p className="text-sm text-slate-400">
          遊戲內 Upgrade and Tune 選單 → Find Tuning Setups → 依讚數排序 → 套用。
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
        <span>來源:{recommendation.source.map((s) => s.name).join(", ")}</span>
        <span>更新於 {recommendation.updatedAt}</span>
        {stale && <span className="rounded bg-amber-900 px-1.5 py-0.5 text-amber-300">可能過時</span>}
      </div>
    </div>
  );
}
