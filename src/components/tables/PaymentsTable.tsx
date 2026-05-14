import { Fragment } from "react";
import { FileText, FilePenLine, Send } from "lucide-react";
import type { PaymentRow, PaymentType } from "../../data/mockData";
import StatusBadge from "../shared/StatusBadge";
import Selector from "../shared/Selector";
import SortableHeader, {
  type SortDirectionLabels,
  type SortState,
} from "../shared/SortableHeader";

export type PaymentColumnId =
  | "type"
  | "reference"
  | "date"
  | "amount"
  | "status";

export const ALL_PAYMENT_COLUMNS: PaymentColumnId[] = [
  "type",
  "reference",
  "date",
  "amount",
  "status",
];

/** Columns the user is not allowed to hide. The toggle UI keeps them in the
 *  list for visual completeness, but they render disabled / un-toggleable. */
export const LOCKED_PAYMENT_COLUMNS: ReadonlySet<PaymentColumnId> = new Set([
  "type",
  "amount",
]);

export const PAYMENT_COLUMN_LABELS: Record<PaymentColumnId, string> = {
  type: "Type",
  reference: "Reference no",
  date: "Date / Due date",
  amount: "Total amount",
  status: "Status",
};

const COLUMN_TEMPLATES: Record<PaymentColumnId, string> = {
  type: "minmax(220px,1.6fr)",
  reference: "minmax(140px,1fr)",
  date: "minmax(170px,1fr)",
  amount: "minmax(160px,1fr)",
  status: "100px",
};

export type PaymentColumnVisibility = Record<PaymentColumnId, boolean>;

export const defaultPaymentColumnVisibility: PaymentColumnVisibility = {
  type: true,
  reference: true,
  date: true,
  amount: true,
  status: true,
};

interface PaymentsTableProps {
  rows: PaymentRow[];
  selected: Record<string, boolean>;
  onSelectedChange: (
    update: (prev: Record<string, boolean>) => Record<string, boolean>
  ) => void;
  onPayRow?: (row: PaymentRow) => void;
  onRowClick?: (row: PaymentRow) => void;
  /** Column visibility map. Defaults to all columns visible. The Type and
   *  Action columns are always shown. */
  columnVisibility?: PaymentColumnVisibility;
  /** Active sort, or `null` for the default order. */
  sortState?: SortState | null;
  onSortChange?: (next: SortState | null) => void;
}

// Per-column menu labels for the sort popover. Picked to match the natural
// way each data type reads (alpha vs numeric vs date).
const SORT_LABELS: Record<PaymentColumnId, SortDirectionLabels> = {
  type: { asc: "A-Z", desc: "Z-A" },
  reference: { asc: "A-Z", desc: "Z-A" },
  date: { asc: "Oldest to newest", desc: "Newest to oldest" },
  amount: { asc: "Lowest to highest", desc: "Highest to lowest" },
  status: { asc: "A-Z", desc: "Z-A" },
};

const typeIconMap: Record<PaymentType, React.ComponentType<{ size?: number; className?: string }>> = {
  Invoice: FileText,
  "Invoice (partial)": FileText,
  "Payment request": Send,
  "Payment request (partial)": Send,
  Estimate: FilePenLine,
};

function ActionButton({
  action,
  onClick,
}: {
  action: PaymentRow["action"];
  onClick?: () => void;
}) {
  if (action === "view") {
    return (
      <button
        onClick={onClick}
        className="h-8 min-w-[88px] px-4 rounded-xl text-[13px] font-normal tracking-tight border border-[var(--color-border)] text-[var(--color-text-primary)] bg-transparent hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
      >
        View
      </button>
    );
  }
  const label = action === "sign-pay" ? "Sign & Pay" : "Pay";
  return (
    <button
      onClick={onClick}
      className="h-8 min-w-[88px] px-4 rounded-xl text-[13px] font-normal tracking-tight bg-[var(--color-brand-8)] text-[var(--color-brand)] hover:bg-[var(--color-brand-20)] transition-colors cursor-pointer"
    >
      {label}
    </button>
  );
}

export default function PaymentsTable({
  rows,
  selected,
  onSelectedChange,
  onPayRow,
  onRowClick,
  columnVisibility = defaultPaymentColumnVisibility,
  sortState = null,
  onSortChange,
}: PaymentsTableProps) {
  // Convenience renderer so each header gets the same sort props.
  const renderHeader = (
    col: PaymentColumnId,
    label: string,
    align: "left" | "right" | "center" = "left",
  ) => (
    <SortableHeader
      label={label}
      sortKey={col}
      sortState={sortState}
      onSort={(next) => onSortChange?.(next)}
      labels={SORT_LABELS[col]}
      align={align}
    />
  );

  const selectableRows = rows.filter((r) => r.status !== "paid");
  const allChecked =
    selectableRows.length > 0 &&
    selectableRows.every((r) => selected[r.reference]);

  // Build the grid template from the visible columns. The checkbox lives
  // inside the Type cell (no standalone column) so the spacing between it
  // and the type icon stays tight; only the action column (112px) is fixed.
  const visibleCols = ALL_PAYMENT_COLUMNS.filter((c) => columnVisibility[c]);
  const gridTemplate = `${visibleCols
    .map((c) => COLUMN_TEMPLATES[c])
    .join(" ")} 112px`;
  const minWidth = computeMinWidth(visibleCols);

  const toggleAll = (checked: boolean) => {
    if (checked) {
      onSelectedChange(() =>
        Object.fromEntries(selectableRows.map((r) => [r.reference, true]))
      );
    } else {
      onSelectedChange(() => ({}));
    }
  };

  return (
    // Same scroll pattern as `AgreementsTable` — vertical scroll is owned by
    // the page-level container; we only enable horizontal scroll on desktop
    // for the wide grid (≥1060px min-width).
    <div className="w-full overflow-hidden bg-[var(--color-bg-surface)] rounded-md border border-[var(--color-border)] md:overflow-x-auto md:rounded-lg">
      <div
        // `min-width` only applies at md+ — on mobile the cards fill the
        // viewport with no horizontal scroll. Driven by a CSS var so the
        // dynamic value (computed from visible columns) stays inline.
        className="flex flex-col md:min-w-[var(--payments-table-min-w)]"
        style={{ "--payments-table-min-w": `${minWidth}px` } as React.CSSProperties}
      >
        {/* Desktop header — hidden on mobile (the mobile rows don't need
            column labels). Scrolls with the page; the page-level sticky tabs
            already pin to the top. */}
        <div
          className="hidden md:grid gap-4 items-center px-3 py-2 border-b border-[var(--color-border)]"
          style={{ gridTemplateColumns: gridTemplate }}
        >
          {columnVisibility.type && (
            <div className="flex items-center gap-3 px-1.5">
              <Selector
                checked={allChecked}
                onChange={toggleAll}
                ariaLabel="Select all rows"
              />
              <SortableHeader
                label="Type"
                sortKey="type"
                sortState={sortState}
                onSort={(next) => onSortChange?.(next)}
                labels={SORT_LABELS.type}
              />
            </div>
          )}
          {columnVisibility.reference &&
            renderHeader("reference", "Reference no.")}
          {columnVisibility.date && renderHeader("date", "Issue / Due date")}
          {columnVisibility.amount &&
            renderHeader("amount", "Total amount", "right")}
          {/* Status — non-sortable. Rendered as a plain cell that mirrors the
              SortableHeader's typography + 6px horizontal padding so the column
              data lines up. */}
          {columnVisibility.status && (
            <div className="flex items-center justify-center">
              <span className="h-7 inline-flex items-center px-1.5 text-sm font-medium tracking-tight text-[var(--color-text-secondary)]">
                Status
              </span>
            </div>
          )}
          <div />
        </div>

        {/* Rows */}
        {rows.map((row) => {
          const TypeIcon = typeIconMap[row.type];
          const isChecked = !!selected[row.reference];
          const isSelectable = row.status !== "paid";
          return (
            <Fragment key={row.reference}>
              {/* Desktop row */}
              <div
                onClick={(e) => {
                  if (!onRowClick) return;
                  // Don't navigate when clicking interactive controls inside the row.
                  const target = e.target as HTMLElement;
                  if (target.closest("button")) return;
                  onRowClick(row);
                }}
                className={`hidden md:grid gap-4 items-center px-3 h-[52px] border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] transition-colors shrink-0 ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
                style={{ gridTemplateColumns: gridTemplate }}
              >
                {/* Type cell — checkbox + type icon + label live together so
                    the checkbox sits flush against the type column instead of
                    floating in its own grid track. */}
                {columnVisibility.type && (
                  <div className="flex items-center gap-3 min-w-0 px-1.5">
                    {isSelectable ? (
                      <Selector
                        checked={isChecked}
                        onChange={(v) =>
                          onSelectedChange((prev) => ({
                            ...prev,
                            [row.reference]: v,
                          }))
                        }
                        ariaLabel={`Select row ${row.reference}`}
                      />
                    ) : (
                      <div className="size-4 shrink-0" />
                    )}
                    <div className="size-9 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-icon-default)] flex items-center justify-center shrink-0">
                      <TypeIcon size={16} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-sm font-semibold text-[var(--color-text-primary)] truncate">
                        {row.type}
                      </span>
                      <span className="text-xs text-[var(--color-text-secondary)] truncate">
                        {row.customer}
                      </span>
                    </div>
                  </div>
                )}

                {/* Reference */}
                {columnVisibility.reference && (
                  <div className="text-sm text-[var(--color-text-primary)] font-mono px-1.5">
                    {row.reference}
                  </div>
                )}

                {/* Dates */}
                {columnVisibility.date && (
                  <div className="text-sm text-[var(--color-text-primary)] px-1.5">
                    {row.issueDate} / {row.dueDate ?? "—"}
                  </div>
                )}

                {/* Amount */}
                {columnVisibility.amount && (
                  <div className="text-sm font-semibold text-[var(--color-text-primary)] text-right tabular-nums px-1.5">
                    {row.totalAmount ? (
                      <>
                        <span className="text-[var(--color-text-secondary)] font-normal">
                          {row.amount} /{" "}
                        </span>
                        {row.totalAmount}
                      </>
                    ) : (
                      row.amount
                    )}
                  </div>
                )}

                {/* Status */}
                {columnVisibility.status && (
                  <div className="flex items-center justify-center px-1.5">
                    <StatusBadge status={row.status} label={row.statusLabel} />
                  </div>
                )}

                {/* Action */}
                <div className="flex items-center">
                  <ActionButton
                    action={row.action}
                    onClick={() => {
                      if (row.action === "view") {
                        onRowClick?.(row);
                      } else {
                        onPayRow?.(row);
                      }
                    }}
                  />
                </div>
              </div>

              {/* Mobile row — collapses the desktop columns into a compact
                  two-column layout (checkbox + type + customer on the left,
                  amount + status on the right). Tap anywhere in the row to
                  open the detail page; tapping the checkbox toggles selection
                  without navigating. */}
              <div
                onClick={(e) => {
                  if (!onRowClick) return;
                  const target = e.target as HTMLElement;
                  // Don't navigate when interacting with the checkbox.
                  if (target.closest('[data-row-checkbox="true"]')) return;
                  onRowClick(row);
                }}
                className={`md:hidden w-full flex items-center gap-4 px-3 h-[52px] border-b border-[var(--color-border)] last:border-b-0 hover:bg-[var(--color-bg-elevated)] transition-colors ${
                  onRowClick ? "cursor-pointer" : ""
                }`}
              >
                <div data-row-checkbox="true" className="flex items-center shrink-0">
                  {isSelectable ? (
                    <Selector
                      checked={isChecked}
                      onChange={(v) =>
                        onSelectedChange((prev) => ({ ...prev, [row.reference]: v }))
                      }
                      ariaLabel={`Select row ${row.reference}`}
                    />
                  ) : (
                    <div className="size-4" />
                  )}
                </div>

                <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                  <span className="text-sm tracking-tight text-[var(--color-text-primary)] truncate leading-tight">
                    {row.type}
                  </span>
                  <span className="text-sm tracking-tight text-[var(--color-text-secondary)] truncate leading-tight">
                    {row.customer}
                  </span>
                </div>

                <div className="flex flex-col gap-0.5 items-end shrink-0">
                  <span className="text-sm tracking-tight text-[var(--color-text-primary)] tabular-nums leading-tight">
                    {row.totalAmount ? (
                      <>
                        <span className="text-[var(--color-text-secondary)]">
                          {row.amount} /{" "}
                        </span>
                        {row.totalAmount}
                      </>
                    ) : (
                      row.amount
                    )}
                  </span>
                  <StatusBadge status={row.status} label={row.statusLabel} />
                </div>

              </div>
            </Fragment>
          );
        })}
      </div>
    </div>
  );
}

// Sum of the minimum widths from each visible column's `minmax(...)` template,
// plus action (112px) and the gaps between cells. The checkbox lives inside
// the Type cell so it doesn't add a track of its own.
function computeMinWidth(visibleCols: PaymentColumnId[]): number {
  const colMins: Record<PaymentColumnId, number> = {
    type: 220,
    reference: 140,
    date: 170,
    amount: 160,
    status: 100,
  };
  const cellsTotal = 112 + visibleCols.reduce((sum, c) => sum + colMins[c], 0);
  const gapTotal = visibleCols.length * 16; // gap-4 between every pair
  const padding = 24; // px-3 left + right
  return cellsTotal + gapTotal + padding;
}

