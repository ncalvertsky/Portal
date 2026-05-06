import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import type { CustomerData } from "../../data/mockData";

interface TransactionRowProps {
  customer: CustomerData;
}

export default function TransactionRow({ customer }: TransactionRowProps) {
  const isPositive = customer.changeType === "positive";

  return (
    <div className="flex items-center justify-between w-full">
      <div className="flex items-center gap-2">
        <div className="size-6 rounded-full bg-[var(--transaction-avatar-bg)] border border-[var(--transaction-avatar-stroke)] flex items-center justify-center overflow-hidden">
          <div className="size-4 rounded-full bg-[var(--color-border-strong)]" />
        </div>
        <span className="text-[var(--transaction-label)] text-base font-semibold">
          {customer.name}
        </span>
        <div className="flex items-center gap-1">
          {isPositive ? (
            <ArrowUpCircle size={16} className="text-[var(--color-positive)]" />
          ) : (
            <ArrowDownCircle size={16} className="text-[var(--color-negative)]" />
          )}
          <span
            className="text-xs font-semibold tracking-wide"
            style={{
              color: isPositive ? "var(--color-positive)" : "var(--color-negative)",
            }}
          >
            {customer.change}
          </span>
        </div>
      </div>
      <span className="text-[var(--transaction-amount)] text-sm">
        {customer.amount}
      </span>
    </div>
  );
}
