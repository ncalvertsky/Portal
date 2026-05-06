import { useState } from "react";
import Legend from "../shared/Legend";
import { payoutActivityData, payoutActivityLegend } from "../../data/mockData";
import type { ChartBarData } from "../../data/mockData";

const periods = ["Monthly", "Daily", "Weekly"] as const;

export default function PayoutActivityChart() {
  const [activePeriod, setActivePeriod] = useState<string>("Monthly");
  const [hoveredBar, setHoveredBar] = useState<ChartBarData | null>(null);

  const maxTotal = Math.max(
    ...payoutActivityData.map((d) => d.primary + d.secondary + d.tertiary)
  );

  const grandTotal = payoutActivityData.reduce(
    (sum, d) => sum + d.primary + d.secondary + d.tertiary,
    0
  );
  const monthCount = payoutActivityData.length;
  const avgPerMonth = Math.round(grandTotal / monthCount).toLocaleString();

  // Y-axis: round up maxTotal to nearest $1k for clean labels
  const yMax = Math.ceil(maxTotal / 1000) * 1000;
  const ySteps = [0, 1000, 2000, 3000, 4000].filter((v) => v <= yMax);
  const yLabels = ySteps.map((v) => (v === 0 ? "$0" : `$${v / 1000}k`));

  return (
    <div className="bg-[var(--stat-card-bg)] border border-[var(--stat-card-stroke)] rounded-2xl p-4 xl:p-6 flex flex-col flex-1 overflow-visible relative min-h-[280px] xl:min-h-0">
      {/* Header with inline period toggle */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 shrink-0">
        <div className="flex flex-col gap-2 md:gap-4">
          <span className="text-[var(--stat-card-label)] text-sm md:text-base font-medium">
            Payout Activity
          </span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-[var(--stat-card-value)] text-xl md:text-[28px] font-semibold leading-none">
              ${avgPerMonth}
            </span>
            <span className="text-[var(--stat-card-value)] text-base md:text-xl font-normal">
              /month
            </span>
          </div>
        </div>
        <div className="flex border border-[var(--color-border)] rounded-lg self-start">
          {periods.map((period) => (
            <button
              key={period}
              onClick={() => setActivePeriod(period)}
              className={`px-3 md:px-4 py-2 md:py-2.5 text-xs md:text-sm font-semibold rounded-lg w-20 md:w-24 text-center transition-colors ${
                activePeriod === period
                  ? "bg-[var(--color-brand)] text-[var(--color-text-on-brand)]"
                  : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              {period}
            </button>
          ))}
        </div>
      </div>

      {/* Chart area */}
      <div className="flex flex-col gap-3 md:gap-5 flex-1 mt-4 md:mt-8 min-h-0">
        {/* Chart with Y-axis */}
        <div className="flex flex-1 min-h-0 gap-2">
          {/* Y-axis labels */}
          <div className="flex flex-col justify-between py-0 shrink-0 w-7">
            {[...yLabels].reverse().map((label) => (
              <span
                key={label}
                className="text-[var(--color-text-secondary)] text-[11px] font-medium leading-none"
              >
                {label}
              </span>
            ))}
          </div>

          {/* Bars with grid lines */}
          <div className="flex-1 relative min-h-0">
            {/* Grid lines */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none" style={{ bottom: "20px" }}>
              {ySteps.map((_, i) => (
                <div
                  key={i}
                  className="w-full border-t border-[var(--color-border)]"
                  style={{ opacity: 0.5 }}
                />
              ))}
            </div>

            {/* Bar columns */}
            <div className="flex items-end gap-1.5 md:gap-3 h-full relative">
              {payoutActivityData.map((bar) => {
                const total = bar.primary + bar.secondary + bar.tertiary;
                const scale = total / yMax;
                const isHovered = hoveredBar?.label === bar.label;
                return (
                  <div
                    key={bar.label}
                    className="flex-1 flex flex-col items-center gap-2 h-full relative"
                    onMouseEnter={() => setHoveredBar(bar)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    <div
                      className={`w-full flex flex-col overflow-hidden mt-auto transition-opacity rounded-lg ${isHovered ? "opacity-100" : "opacity-90"}`}
                      style={{ height: `${scale * 100}%` }}
                    >
                      <div
                        className="w-full"
                        style={{
                          backgroundColor: "var(--color-brand-20)",
                          flex: bar.tertiary,
                        }}
                      />
                      <div
                        className="w-full"
                        style={{
                          backgroundColor: "var(--color-brand-50)",
                          flex: bar.secondary,
                        }}
                      />
                      <div
                        className="w-full"
                        style={{
                          backgroundColor: "var(--color-brand)",
                          flex: bar.primary,
                        }}
                      />
                    </div>
                    <span className="text-[var(--color-text-secondary)] text-[11px] font-medium text-center shrink-0">
                      {bar.label}
                    </span>

                    {/* Tooltip */}
                    {isHovered && (
                      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 z-10 bg-[var(--color-bg-elevated)] border border-[var(--color-border-strong)] rounded-lg px-3 py-2.5 shadow-lg whitespace-nowrap pointer-events-none">
                        <div className="text-[var(--color-text-primary)] text-xs font-semibold mb-1.5">
                          {bar.label}
                        </div>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-sm" style={{ backgroundColor: "var(--color-brand)" }} />
                            <span className="text-[var(--color-text-secondary)] text-[11px]">Cards</span>
                            <span className="text-[var(--color-text-primary)] text-[11px] font-semibold ml-auto pl-3">{bar.cardPayments}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-sm" style={{ backgroundColor: "var(--color-brand-50)" }} />
                            <span className="text-[var(--color-text-secondary)] text-[11px]">Bank</span>
                            <span className="text-[var(--color-text-primary)] text-[11px] font-semibold ml-auto pl-3">{bar.payByBank}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <div className="size-2 rounded-sm" style={{ backgroundColor: "var(--color-brand-20)" }} />
                            <span className="text-[var(--color-text-secondary)] text-[11px]">Instant</span>
                            <span className="text-[var(--color-text-primary)] text-[11px] font-semibold ml-auto pl-3">{bar.instantPayments}</span>
                          </div>
                          <div className="border-t border-[var(--color-border)] mt-1 pt-1 flex items-center justify-between">
                            <span className="text-[var(--color-text-secondary)] text-[11px]">Total</span>
                            <span className="text-[var(--color-text-primary)] text-xs font-semibold">{bar.total}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Legend */}
        <Legend items={payoutActivityLegend} />
      </div>
    </div>
  );
}
