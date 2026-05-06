import Legend from "../shared/Legend";
import { receivablesData, receivablesLegend } from "../../data/mockData";

export default function ReceivablesSummary() {
  return (
    <div className="bg-[var(--stat-card-bg)] border border-[var(--stat-card-stroke)] rounded-2xl p-4 xl:p-6 flex flex-col gap-4 xl:gap-6 overflow-hidden min-h-[240px] h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="text-[var(--stat-card-value)] text-xl font-semibold">
          Receivables Summary
        </span>
        <span className="text-[var(--stat-card-label)] text-sm font-medium">
          See what's overdue and take action
        </span>
      </div>

      {/* Bars */}
      <div className="flex items-end gap-3 flex-1">
        {receivablesData.map((bar) => (
          <div
            key={bar.label}
            className="flex-1 flex flex-col items-center gap-2 justify-end h-full"
          >
            <div
              className="w-full opacity-90 rounded-lg"
              style={{
                height: `${bar.height}%`,
                backgroundColor: bar.color,
              }}
            />
            <span className="text-[var(--color-text-secondary)] text-[11px] font-medium text-center">
              {bar.label}
            </span>
          </div>
        ))}
      </div>

      {/* Legend */}
      <Legend items={receivablesLegend} />
    </div>
  );
}
