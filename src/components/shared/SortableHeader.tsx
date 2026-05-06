import { ArrowDown, ArrowUp } from "lucide-react";
import Popover from "./Popover";

export type SortDirection = "asc" | "desc";

export interface SortState {
  /** Opaque column identifier — defined by the consuming table. */
  key: string;
  direction: SortDirection;
}

export interface SortDirectionLabels {
  asc: string;
  desc: string;
}

interface SortableHeaderProps {
  label: string;
  sortKey: string;
  /** Current table sort. `null` means no column is sorted. */
  sortState: SortState | null;
  onSort: (next: SortState | null) => void;
  /** Direction-specific menu labels (e.g. "Lowest to highest"). */
  labels: SortDirectionLabels;
  align?: "left" | "right" | "center";
}

/** Header cell that doubles as a sort trigger.
 *
 *  - Default: plain text label, no chrome.
 *  - Hover / active sort: surface background + small arrow indicator.
 *  - Click opens a popover with `<asc> / <desc> / Clear sort` options.
 */
export default function SortableHeader({
  label,
  sortKey,
  sortState,
  onSort,
  labels,
  align = "left",
}: SortableHeaderProps) {
  const active = sortState?.key === sortKey;
  const direction = active ? sortState!.direction : null;

  // Indicator arrow: shows the current sort direction when this column is
  // active, otherwise a down-arrow on hover only (the "sortable" affordance).
  const ActiveIcon = direction === "asc" ? ArrowUp : ArrowDown;
  const renderIndicator = () =>
    active ? (
      <ActiveIcon size={12} className="shrink-0" />
    ) : (
      // Hidden by default, shows on hover (the Figma `header / hover` variant).
      <ArrowDown
        size={12}
        className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
      />
    );

  const justify =
    align === "right"
      ? "justify-end"
      : align === "center"
        ? "justify-center"
        : "justify-start";

  // Wrap the Popover in a flex container so the trigger button hugs its
  // content (label + arrow) and the grid-cell alignment lives on the wrapper
  // — the button itself is intrinsic-sized.
  return (
    <div className={`flex items-center ${justify}`}>
    <Popover
      align={align === "right" ? "end" : "start"}
      panelClassName="w-56 p-2 flex flex-col"
      trigger={({ open, toggle }) => (
        <button
          type="button"
          onClick={toggle}
          aria-haspopup="menu"
          aria-expanded={open}
          className={`group inline-flex items-center gap-1 h-7 px-1.5 rounded-md text-sm font-medium tracking-tight text-[var(--color-text-secondary)] transition-colors ${
            active || open
              ? "bg-[var(--color-bg-surface)]"
              : "hover:bg-[var(--color-bg-surface)]"
          }`}
        >
          {align === "right" && renderIndicator()}
          <span className="truncate">{label}</span>
          {align !== "right" && renderIndicator()}
        </button>
      )}
    >
      {(close) => (
        <>
          <SortMenuItem
            selected={active && direction === "asc"}
            onClick={() => {
              onSort({ key: sortKey, direction: "asc" });
              close();
            }}
          >
            {labels.asc}
          </SortMenuItem>
          <SortMenuItem
            selected={active && direction === "desc"}
            onClick={() => {
              onSort({ key: sortKey, direction: "desc" });
              close();
            }}
          >
            {labels.desc}
          </SortMenuItem>
          {active && (
            <SortMenuItem
              onClick={() => {
                onSort(null);
                close();
              }}
            >
              Clear sort
            </SortMenuItem>
          )}
        </>
      )}
    </Popover>
    </div>
  );
}

function SortMenuItem({
  children,
  selected = false,
  onClick,
}: {
  children: React.ReactNode;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onClick={onClick}
      className={`w-full flex items-center h-[42px] px-4 rounded-xl text-left hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer text-sm tracking-tight ${
        selected
          ? "text-[var(--color-brand)]"
          : "text-[var(--color-text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}
