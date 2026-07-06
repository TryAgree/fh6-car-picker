import { useState } from "react";
import { DisciplineClassPicker } from "./components/DisciplineClassPicker";
import { EmptyState } from "./components/EmptyState";
import { RecommendationCard } from "./components/RecommendationCard";
import { recommendations } from "./lib/data";
import { classifySelection } from "./lib/filter";
import type { Class, Discipline } from "./types";

function App() {
  const [discipline, setDiscipline] = useState<Discipline | undefined>(undefined);
  const [klass, setKlass] = useState<Class | undefined>(undefined);

  const selection = classifySelection(recommendations, discipline, klass);

  return (
    <div className="relative min-h-screen bg-slate-950 text-slate-100 px-6 py-10">
      <div className="mx-auto max-w-md sm:max-w-2xl space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold">FH6 Car Picker</h1>
          <p className="text-slate-400">
            選賽事、選車級,回傳社群 meta 推薦車種與調校碼。
          </p>
        </header>

        <DisciplineClassPicker
          discipline={discipline}
          klass={klass}
          onDisciplineChange={setDiscipline}
          onClassChange={setKlass}
        />

        <div>
          {selection.kind === "results" ? (
            <div className="space-y-3">
              {selection.items.map((r) => (
                <RecommendationCard key={`${r.discipline}-${r.class}-${r.carId}`} recommendation={r} />
              ))}
            </div>
          ) : (
            <EmptyState selection={selection} />
          )}
        </div>
      </div>

      <footer className="mt-10 text-center text-xs text-slate-500">
        車輛與調校資料整理自{" "}
        <a
          href="https://github.com/adolphin8/fh6-tier-list"
          className="underline hover:text-slate-300"
          target="_blank"
          rel="noreferrer"
        >
          adolphin8/fh6-tier-list
        </a>{" "}
        (MIT License)
      </footer>
    </div>
  );
}

export default App;
