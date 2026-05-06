import StatCard from "../cards/StatCard";
import { quickStats } from "../../data/mockData";

export default function QuickStatsGrid() {
  return (
    <div className="bg-[var(--stat-card-bg)] border border-[var(--stat-card-stroke)] rounded-2xl p-4 xl:p-6 shrink-0 overflow-hidden w-full xl:w-[464px]">
      <div className="grid grid-cols-2 gap-3 xl:gap-4 h-full">
        {quickStats.map((stat) => (
          <StatCard key={stat.label} data={stat} variant="inner" />
        ))}
      </div>
    </div>
  );
}
