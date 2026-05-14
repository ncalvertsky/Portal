import { ArrowUpRight, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import type { StatCardData } from "../../data/mockData";

interface StatCardProps {
  data: StatCardData;
  variant?: "default" | "inner";
}

export default function StatCard({ data, variant = "default" }: StatCardProps) {
  const changeColor =
    data.changeType === "positive"
      ? "var(--color-positive)"
      : data.changeType === "negative"
        ? "var(--color-negative)"
        : "var(--color-neutral-warn)";

  const bgClass =
    variant === "inner"
      ? "bg-[var(--color-bg-page)] border border-[var(--stat-card-stroke)] hover:bg-[var(--stat-card-bg-hover)] hover:border-[var(--stat-card-stroke-hover)]"
      : "bg-[var(--stat-card-bg)] border border-[var(--stat-card-stroke)] hover:bg-[var(--stat-card-bg-hover)] hover:border-[var(--stat-card-stroke-hover)]";

  return (
    <div
      className={`${bgClass} rounded-lg xl:rounded-xl px-4 xl:px-6 py-3 xl:py-4 flex flex-col ${variant === "inner" ? "justify-between" : "gap-2 xl:gap-3"} h-full min-w-0 cursor-pointer transition-colors duration-150`}
    >
      <div className="flex flex-col gap-2 xl:gap-3">
        <div className="flex items-center justify-between">
          <span className="text-[var(--stat-card-label)] text-sm xl:text-base font-medium">
            {data.label}
          </span>
          <ArrowUpRight size={18} className="text-[var(--stat-card-label)] shrink-0" />
        </div>
        <span className="text-[var(--stat-card-value)] text-lg xl:text-2xl font-semibold leading-none">
          {data.value}
        </span>
      </div>
      <div className="flex items-center gap-1">
        {data.changeType === "positive" || data.changeType === "neutral" ? (
          <ArrowUpCircle size={16} style={{ color: changeColor }} />
        ) : (
          <ArrowDownCircle size={16} style={{ color: changeColor }} />
        )}
        <span
          className="text-[11px] font-medium tracking-wide"
          style={{ color: changeColor }}
        >
          {data.change}
        </span>
      </div>
    </div>
  );
}
