import { Calendar, Check, ChevronDown } from "lucide-react";
import Popover from "./Popover";

/** Pill input used inside Amount-range filter popovers. */
export function AmountInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="w-full flex items-center gap-2 h-11 px-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] focus-within:border-[var(--color-border-focus)] transition-colors">
      <span className="w-4 text-center text-base text-[var(--color-text-primary)] shrink-0">
        $
      </span>
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-transparent outline-none text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
      />
    </div>
  );
}

/** Pill input used inside Date-range filter popovers. */
export function DateInput({
  value,
  onChange,
  placeholder = "MM-DD-YY",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="w-full flex items-center gap-2 h-11 px-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] focus-within:border-[var(--color-border-focus)] transition-colors">
      <Calendar size={20} className="text-[var(--color-icon-secondary)] shrink-0" />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-transparent outline-none text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)]"
      />
    </div>
  );
}

export function DateFieldGroup({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium tracking-tight text-[var(--color-text-secondary)]">
        {label}
      </span>
      <DateInput value={value} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

/** Multi-select row used in filter popovers (Status, Merchant, etc.). */
export function CheckRow({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={checked}
      onClick={onToggle}
      className="w-full flex items-center gap-3 h-[42px] pl-4 pr-3 rounded-xl text-left hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
    >
      <span className="flex-1 min-w-0 text-sm tracking-tight text-[var(--color-text-primary)] truncate">
        {label}
      </span>
      {checked && (
        <Check size={20} className="text-[var(--color-brand)] shrink-0" />
      )}
    </button>
  );
}

// ----- Date preset helpers ---------------------------------------------------

export type DatePreset = "all" | "today" | "7d" | "30d" | "60d" | "90d" | "custom";

/** Quick-range presets shown in the "Show ___ for" menu inside Date popovers. */
export const datePresetOptions: { id: DatePreset; label: string }[] = [
  { id: "today", label: "Today" },
  { id: "7d", label: "Last 7 days" },
  { id: "30d", label: "Last 30 days" },
  { id: "60d", label: "Last 60 days" },
  { id: "90d", label: "Last 90 days" },
];

export const PRESET_LABELS: Record<DatePreset, string> = {
  all: "All time",
  today: "Today",
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "60d": "Last 60 days",
  "90d": "Last 90 days",
  custom: "Custom range",
};

export function formatMMDDYY(d: Date): string {
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}-${dd}-${yy}`;
}

export function presetRange(p: DatePreset): { from: string; to: string } {
  const today = new Date();
  const t = formatMMDDYY(today);
  const back = (days: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() - days);
    return formatMMDDYY(d);
  };
  switch (p) {
    case "all":
      return { from: "", to: "" };
    case "today":
      return { from: t, to: t };
    case "7d":
      return { from: back(6), to: t };
    case "30d":
      return { from: back(29), to: t };
    case "60d":
      return { from: back(59), to: t };
    case "90d":
      return { from: back(89), to: t };
    case "custom":
      return { from: "", to: "" };
  }
}

export function detectPreset(from: string, to: string): DatePreset {
  if (!from && !to) return "all";
  for (const o of datePresetOptions) {
    if (o.id === "all" || o.id === "custom") continue;
    const r = presetRange(o.id);
    if (r.from === from && r.to === to) return o.id;
  }
  return "custom";
}

/** Trigger + popover that lists the quick-range presets. */
export function PresetMenu({
  value,
  onChange,
}: {
  value: DatePreset;
  onChange: (p: DatePreset) => void;
}) {
  return (
    <Popover
      matchTriggerWidth
      panelClassName="p-2 flex flex-col"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={open}
          onClick={toggle}
          className={`w-full flex items-center justify-between h-11 px-4 rounded-2xl bg-[var(--color-bg-surface)] border text-sm text-[var(--color-text-primary)] outline-none cursor-pointer transition-colors ${
            open
              ? "border-[var(--color-border-focus)]"
              : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
          }`}
        >
          <span>{PRESET_LABELS[value]}</span>
          <ChevronDown
            size={20}
            className={`text-[var(--color-icon-secondary)] transition-transform ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
      )}
    >
      {(close) =>
        datePresetOptions.map((o) => (
          <button
            key={o.id}
            type="button"
            role="menuitem"
            onClick={() => {
              onChange(o.id);
              close();
            }}
            className="w-full flex items-center h-[42px] pl-4 pr-3 rounded-xl text-left hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer text-sm tracking-tight text-[var(--color-text-primary)]"
          >
            {o.label}
          </button>
        ))
      }
    </Popover>
  );
}
