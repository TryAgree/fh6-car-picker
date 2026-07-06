import type { Discipline } from "../types";
import type { Selection } from "../lib/filter";

const DISCIPLINE_EMPTY_HINTS: Partial<Record<Discipline, string>> = {
  touge: "可參考 Drift 分類(概念相近,但非嚴格對應 touge 的山道對決玩法)。",
};

type EmptySelection = Exclude<Selection, { kind: "results" }>;

export function EmptyState({ selection }: { selection: EmptySelection }) {
  if (selection.kind === "idle") {
    return (
      <p className="text-center text-slate-400">選擇賽事類型與車級,開始查詢推薦車款。</p>
    );
  }

  if (selection.kind === "discipline-empty") {
    const hint = DISCIPLINE_EMPTY_HINTS[selection.discipline];
    return (
      <div className="text-center text-slate-400">
        <p>這個賽事類型目前完全沒有資料。</p>
        {hint && <p className="mt-1 text-sm">{hint}</p>}
      </div>
    );
  }

  return (
    <p className="text-center text-slate-400">
      這個賽事類型有資料,但 {selection.klass} 級目前還沒收錄推薦車款,試試其他車級。
    </p>
  );
}
