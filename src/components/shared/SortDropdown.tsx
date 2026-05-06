import { useEffect, useRef, useState } from "react";
import { Check, ChevronDown } from "lucide-react";

export interface SortOption<Id extends string = string> {
  id: Id;
  label: string;
}

interface SortDropdownProps<Id extends string = string> {
  options: SortOption<Id>[];
  value: Id;
  onChange: (id: Id) => void;
}

export default function SortDropdown<Id extends string = string>({
  options,
  value,
  onChange,
}: SortDropdownProps<Id>) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const active = options.find((o) => o.id === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl px-3 h-10 text-sm font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
      >
        {active.label}
        <ChevronDown
          size={16}
          className={`text-[var(--color-icon-secondary)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-[280px] rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-lg p-2 z-20">
          {options.map((option) => {
            const isActive = option.id === value;
            return (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  onChange(option.id);
                  setOpen(false);
                }}
                className="flex items-center gap-2 w-full h-[42px] px-4 rounded-xl text-base font-normal tracking-tight text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
              >
                <span className="flex-1 text-left">{option.label}</span>
                {isActive && (
                  <Check size={18} className="text-[var(--color-brand)] shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
