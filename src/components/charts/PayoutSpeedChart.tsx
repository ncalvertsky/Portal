import { Triangle } from "lucide-react";
import Legend from "../shared/Legend";
import { payoutSpeedLegend, payoutSpeedSegments } from "../../data/mockData";

export default function PayoutSpeedChart() {
  return (
    <div className="bg-[var(--stat-card-bg)] border border-[var(--stat-card-stroke)] rounded-2xl p-4 xl:p-6 flex flex-col gap-4 xl:gap-6 overflow-hidden min-h-[240px] h-full">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <span className="text-[var(--stat-card-value)] text-xl font-semibold">
          Payout Speed
        </span>
        <span className="text-[var(--stat-card-label)] text-sm font-medium">
          How fast you're getting paid
        </span>
      </div>

      {/* Chart */}
      <div className="flex flex-col gap-1 flex-1 justify-center">
        {/* Top triangle indicator */}
        <div className="flex justify-end pr-[20%]">
          <Triangle
            size={14}
            className="text-[var(--color-text-secondary)] fill-[var(--color-text-secondary)] rotate-180"
          />
        </div>

        {/* Horizontal stacked bar */}
        <div className="flex h-16 overflow-hidden rounded-lg">
          {payoutSpeedSegments.map((segment, i) => (
            <div
              key={i}
              className="h-full opacity-90"
              style={{
                width: segment.width,
                backgroundColor: segment.color,
              }}
            />
          ))}
        </div>

        {/* Bottom triangle indicator */}
        <div className="flex justify-end pr-[20%]">
          <Triangle
            size={14}
            className="text-[var(--color-text-secondary)] fill-[var(--color-text-secondary)]"
          />
        </div>
      </div>

      {/* Legend */}
      <Legend items={payoutSpeedLegend} />
    </div>
  );
}
