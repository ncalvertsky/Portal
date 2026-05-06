import { X, AlertCircle } from "lucide-react";
import Tooltip from "./Tooltip";

interface BulkSelectBarProps {
  count: number;
  total: string;
  disabled?: boolean;
  payLabel?: string;
  onCancel: () => void;
  onPay: () => void;
}

export default function BulkSelectBar({
  count,
  total,
  disabled = false,
  payLabel = "Pay",
  onCancel,
  onPay,
}: BulkSelectBarProps) {
  if (count === 0) return null;

  return (
    <div className="sticky bottom-0 z-20 flex justify-center shrink-0 pointer-events-none">
      <div
        className={`pointer-events-auto flex items-center justify-between gap-4 w-full max-w-[600px] bg-[var(--color-bg-surface)] backdrop-blur-md border rounded-2xl pl-3 pr-2 py-2 shadow-lg ${
          disabled
            ? "border-[var(--color-negative)]"
            : "border-[var(--color-border)]"
        }`}
      >
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onCancel}
            aria-label="Clear selection"
            className="size-9 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-border-strong)] transition-colors cursor-pointer shrink-0"
          >
            <X size={16} />
          </button>
          <div className="flex items-center gap-2 min-w-0">
            {disabled && (
              <Tooltip content="You can only pay invoices from the same business at once">
                <AlertCircle
                  size={16}
                  className="text-[var(--color-negative)] cursor-help shrink-0"
                />
              </Tooltip>
            )}
            <span className="text-base font-medium tracking-tight text-[var(--color-text-primary)] truncate">
              {count} selected
            </span>
            <span className="size-1 rounded-full bg-[var(--color-icon-secondary)] shrink-0" />
            <span className="text-base font-medium tracking-tight text-[var(--color-text-primary)] tabular-nums truncate">
              {total}
            </span>
          </div>
        </div>
        <button
          onClick={disabled ? undefined : onPay}
          disabled={disabled}
          className={`h-11 min-w-[88px] px-4 rounded-xl text-sm font-medium tracking-tight transition-opacity shrink-0 ${
            disabled
              ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] cursor-not-allowed"
              : "bg-[var(--color-brand)] text-[var(--color-text-on-brand)] hover:opacity-90 cursor-pointer"
          }`}
        >
          {payLabel}
        </button>
      </div>
    </div>
  );
}
