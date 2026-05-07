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

const iconColorByTone: Record<SummaryCardTone, string> = {
  default: "text-[var(--color-icon-default)]",
  danger: "text-[var(--color-text-danger)]",
  warning: "text-[var(--color-text-warning)]",
  success: "text-[var(--color-text-success)]",
};

// Background + border applied only at md+. On mobile the icon is bare to
// match the tighter pill design.
const iconBgByTone: Record<SummaryCardTone, string> = {
  default:
    "md:bg-[var(--color-bg-surface)] md:border md:border-[var(--color-border)]",
  danger:
    "md:bg-[color-mix(in_srgb,var(--color-text-danger)_12%,transparent)] md:border md:border-[var(--color-border-danger)]",
  warning:
    "md:bg-[color-mix(in_srgb,var(--color-text-warning)_12%,transparent)] md:border md:border-[var(--color-text-warning)]",
  success:
    "md:bg-[color-mix(in_srgb,var(--color-text-success)_12%,transparent)] md:border md:border-[var(--color-text-success)]",
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
    "shrink-0 rounded-full md:rounded-[var(--radius-lg)] border pl-2 pr-6 py-2 md:pl-4 md:pr-6 md:py-4 flex items-center gap-1 md:gap-3 text-left transition-colors cursor-pointer md:min-w-[140px]";

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
        className={`size-6 md:size-9 shrink-0 rounded-2xl md:rounded-full flex items-center justify-center ${iconColorByTone[tone]} ${iconBgByTone[tone]}`}
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
          <span className="hidden md:inline text-xs font-medium leading-none tracking-tight text-[var(--color-text-primary)] whitespace-nowrap">
            {total}
          </span>
        )}
      </div>
    </button>
  );
}
