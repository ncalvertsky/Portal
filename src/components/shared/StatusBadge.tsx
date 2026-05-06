import { AlertCircle } from "lucide-react";
import type { PaymentStatus } from "../../data/mockData";
import Tooltip from "./Tooltip";

interface StatusBadgeProps {
  status: PaymentStatus;
  label: string;
}

const PAYMENT_TOOLTIPS: Partial<Record<PaymentStatus, string>> = {
  "due-soon": "This payment is due in the next few days. Pay now to stay on schedule.",
  overdue: "This payment is past its due date. Pay now to avoid late fees.",
};

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  if (status === "due-soon" || status === "overdue") {
    const colorClass =
      status === "due-soon"
        ? "text-[var(--color-text-warning)]"
        : "text-[var(--color-negative)]";
    return (
      <Tooltip content={PAYMENT_TOOLTIPS[status]!}>
        <span
          className={`inline-flex items-center gap-1.5 text-sm font-medium cursor-help ${colorClass}`}
        >
          <AlertCircle size={14} />
          {label}
        </span>
      </Tooltip>
    );
  }

  return (
    <span className="text-sm font-medium text-[var(--color-text-secondary)]">
      {label}
    </span>
  );
}
