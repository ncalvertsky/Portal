import type { LegendItem } from "../../data/mockData";

interface LegendProps {
  items: LegendItem[];
}

export default function Legend({ items }: LegendProps) {
  return (
    <div className="flex items-center gap-5">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-2">
          <div
            className="size-3.5 rounded-[var(--legend-swatch-radius,4px)]"
            style={{ backgroundColor: item.color }}
          />
          <span className="text-[var(--color-text-secondary)] text-sm font-semibold">
            {item.label}
          </span>
        </div>
      ))}
    </div>
  );
}
