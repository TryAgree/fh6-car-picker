import type { Class, Discipline } from "../types";

const DISCIPLINES: { value: Discipline; label: string }[] = [
  { value: "road", label: "Road" },
  { value: "street", label: "Street" },
  { value: "dirt", label: "Dirt" },
  { value: "xc", label: "Cross-Country" },
  { value: "touge", label: "Touge" },
  { value: "drag", label: "Drag" },
  { value: "drift", label: "Drift" },
];

const CLASSES: Class[] = ["D", "C", "B", "A", "S1", "S2", "R", "X"];

function PickerButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-11 min-w-11 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
        selected
          ? "bg-emerald-500 text-slate-950"
          : "bg-slate-800 text-slate-200 hover:bg-slate-700"
      }`}
    >
      {children}
    </button>
  );
}

export function DisciplineClassPicker({
  discipline,
  klass,
  onDisciplineChange,
  onClassChange,
}: {
  discipline: Discipline | undefined;
  klass: Class | undefined;
  onDisciplineChange: (d: Discipline) => void;
  onClassChange: (c: Class) => void;
}) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          賽事類型
        </h2>
        <div className="flex flex-wrap gap-2">
          {DISCIPLINES.map((d) => (
            <PickerButton
              key={d.value}
              selected={discipline === d.value}
              onClick={() => onDisciplineChange(d.value)}
            >
              {d.label}
            </PickerButton>
          ))}
        </div>
      </div>
      <div>
        <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">車級</h2>
        <div className="flex flex-wrap gap-2">
          {CLASSES.map((c) => (
            <PickerButton key={c} selected={klass === c} onClick={() => onClassChange(c)}>
              {c}
            </PickerButton>
          ))}
        </div>
      </div>
    </div>
  );
}
