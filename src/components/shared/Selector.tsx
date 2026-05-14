interface SelectorProps {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export default function Selector({
  checked,
  onChange,
  disabled = false,
  className = "",
  ariaLabel,
}: SelectorProps) {
  const base =
    "size-4 rounded-xs border-[1.2px] inline-flex items-center justify-center transition-colors shrink-0";

  const interactive = disabled
    ? "cursor-not-allowed opacity-60"
    : "cursor-pointer";

  const stateClasses = checked
    ? `bg-[var(--color-brand)] border-[var(--color-brand)] ${
        !disabled ? "hover:opacity-80" : ""
      }`
    : `bg-[var(--color-bg-page)] border-[var(--color-border)] ${
        !disabled ? "hover:border-[var(--color-border-strong)]" : ""
      }`;

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={ariaLabel}
      disabled={disabled}
      onClick={() => onChange?.(!checked)}
      className={`${base} ${stateClasses} ${interactive} ${className}`}
    >
      {checked && (
        <svg
          viewBox="0 0 10 8"
          className="w-[9px] h-[6px]"
          fill="none"
          aria-hidden
        >
          <path
            d="M1 4l2.5 2.5L9 1"
            stroke="var(--color-text-on-brand)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
