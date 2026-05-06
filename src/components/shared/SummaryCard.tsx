import type { LucideIcon } from "lucide-react";

export type SummaryCardTone = "default" | "danger" | "warning" | "success";

interface SummaryCardProps {
  label: string;
  count: string;
  total?: string;
  icon: LucideIcon;
  tone?: SummaryCardTone;
  selected?: boolean;
  onClick?: () => void;
}

const iconContainerByTone: Record<SummaryCardTone, string> = {
  default:
    "bg-[var(--color-bg-surface)] border-[var(--color-border)] text-[var(--color-icon-default)]",
  danger:
    "bg-[color-mix(in_srgb,var(--color-text-danger)_12%,transparent)] border-[var(--color-border-danger)] text-[var(--color-text-danger)]",
  warning:
    "bg-[color-mix(in_srgb,var(--color-text-warning)_12%,transparent)] border-[var(--color-text-warning)] text-[var(--color-text-warning)]",
  success:
    "bg-[color-mix(in_srgb,var(--color-text-success)_12%,transparent)] border-[var(--color-text-success)] text-[var(--color-text-success)]",
};

export default function SummaryCard({
  label,
  count,
  total,
  icon: Icon,
  tone = "default",
  selected = false,
  onClick,
}: SummaryCardProps) {
  const base =
    "shrink-0 min-w-[140px] rounded-[var(--radius-lg)] border pl-4 pr-6 py-4 flex items-center gap-3 text-left transition-colors cursor-pointer";

  const stateClasses = selected
    ? "bg-[var(--color-bg-surface)] border-[var(--color-border-brand)]"
    : "bg-[var(--color-bg-surface)] border-[var(--color-border)] hover:border-[var(--color-border-strong)]";

  return (
    <button
      onClick={onClick}
      aria-pressed={selected}
      className={`${base} ${stateClasses}`}
    >
      <div
        className={`size-9 shrink-0 rounded-full border flex items-center justify-center ${iconContainerByTone[tone]}`}
      >
        <Icon size={16} />
      </div>
      <span className="text-[18px] font-medium leading-none tracking-tight text-[var(--color-text-primary)]">
        {count}
      </span>
      <div className="flex flex-col gap-1.5 items-start">
        <span className="text-xs font-medium leading-none tracking-tight text-[var(--color-text-tertiary)] whitespace-nowrap">
          {label}
        </span>
        {total && (
          <span className="text-xs font-medium leading-none tracking-tight text-[var(--color-text-primary)] whitespace-nowrap">
            {total}
          </span>
        )}
      </div>
    </button>
  );
}
