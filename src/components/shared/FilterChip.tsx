import { ChevronDown, X } from "lucide-react";
import type { ReactNode } from "react";

interface FilterChipProps {
  label: ReactNode;
  /** When true, renders the "selected" variant with an X icon on the left
   *  and `onClear` wired to remove the filter. */
  selected?: boolean;
  /** Called when the user clicks the chip body. */
  onClick?: () => void;
  /** Called when the user clicks the X icon on a selected chip. */
  onClear?: () => void;
  disabled?: boolean;
  className?: string;
}

export default function FilterChip({
  label,
  selected = false,
  onClick,
  onClear,
  disabled = false,
  className = "",
}: FilterChipProps) {
  // Selected & default-unselected use bg-elevated; press/active swap the
  // border. Hover lifts unselected to bg-elevated.
  const stateClasses = disabled
    ? "bg-[var(--color-bg-surface)] border-[var(--color-border)] text-[var(--color-text-disabled)] cursor-not-allowed"
    : selected
      ? "bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)] active:border-[var(--color-border-strong)] focus-visible:border-[var(--color-border-focus)] cursor-pointer"
      : "bg-[var(--color-bg-surface)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] active:bg-[var(--color-bg-surface)] active:border-[var(--color-border-strong)] focus-visible:border-[var(--color-border-focus)] cursor-pointer";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`shrink-0 inline-flex items-center gap-2 h-11 px-4 rounded-2xl border text-sm leading-none whitespace-nowrap transition-colors focus-visible:outline-none ${stateClasses} ${className}`}
    >
      {selected ? (
        <>
          <span
            role="button"
            aria-label="Clear filter"
            onClick={(e) => {
              if (disabled) return;
              e.stopPropagation();
              onClear?.();
            }}
            className="shrink-0 inline-flex items-center justify-center text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            <X size={20} />
          </span>
          <span>{label}</span>
        </>
      ) : (
        <>
          <span>{label}</span>
          <ChevronDown
            size={20}
            className="shrink-0 text-[var(--color-icon-secondary)]"
          />
        </>
      )}
    </button>
  );
}
