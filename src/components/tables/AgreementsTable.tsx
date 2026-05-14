import { Fragment } from "react";
import { AlertCircle, FileEdit } from "lucide-react";
import type { AgreementRow, AgreementStatus } from "../../data/mockData";
import Tooltip from "../shared/Tooltip";
import SortableHeader, {
  type SortDirectionLabels,
  type SortState,
} from "../shared/SortableHeader";

const AGREEMENT_TOOLTIPS: Partial<Record<AgreementStatus, string>> = {
  "due-soon":
    "This agreement is due for signature soon. Sign to keep your payment on schedule.",
  overdue:
    "This agreement is past due. Sign now to release the payment and avoid late fees.",
};

export type AgreementColumnId =
  | "type"
  | "issueDate"
  | "signingDate"
  | "amount";

const SORT_LABELS: Record<AgreementColumnId, SortDirectionLabels> = {
  type: { asc: "A-Z", desc: "Z-A" },
  issueDate: { asc: "Oldest to newest", desc: "Newest to oldest" },
  signingDate: { asc: "Oldest to newest", desc: "Newest to oldest" },
  amount: { asc: "Lowest to highest", desc: "Highest to lowest" },
};

interface AgreementsTableProps {
  rows: AgreementRow[];
  onAction?: (row: AgreementRow) => void;
  onViewRequest?: (reference: string) => void;
  sortState?: SortState | null;
  onSortChange?: (next: SortState | null) => void;
}

/**
 * Parse the linked invoice/estimate reference out of an agreement's `orderType`
 * string. The last whitespace-delimited token is the identifier; we prepend "#"
 * if it isn't already there so it matches the format used in `paymentRows`.
 *
 * Examples:
 *   "Invoice #617297329"        -> "#617297329"
 *   "Invoice (partial) #615082918" -> "#615082918"
 *   "Estimate EST-7319"         -> "#EST-7319"
 */
function extractReference(orderType: string): string {
  const lastToken = orderType.trim().split(/\s+/).pop() ?? "";
  return lastToken.startsWith("#") ? lastToken : `#${lastToken}`;
}

function StatusCell({ status, label }: { status: AgreementStatus; label: string }) {
  if (status === "due-soon" || status === "overdue") {
    const colorClass =
      status === "due-soon"
        ? "text-[var(--color-neutral-warn)]"
        : "text-[var(--color-negative)]";
    return (
      <Tooltip content={AGREEMENT_TOOLTIPS[status]!}>
        <span
          className={`inline-flex items-center gap-1.5 text-[13px] tracking-tight cursor-help ${colorClass}`}
        >
          <AlertCircle size={14} />
          {label}
        </span>
      </Tooltip>
    );
  }
  return (
    <span className="text-[13px] tracking-tight text-[var(--color-text-primary)]">
      {label}
    </span>
  );
}

function ActionButton({
  action,
  onClick,
}: {
  action: AgreementRow["action"];
  onClick?: () => void;
}) {
  if (action === "view") {
    return (
      <button
        onClick={onClick}
        className="h-8 min-w-[96px] px-4 rounded-xl text-[13px] font-normal tracking-tight border border-[var(--color-border)] text-[var(--color-text-primary)] bg-transparent hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
      >
        View
      </button>
    );
  }
  const label = action === "sign-pay" ? "Sign & Pay" : "Sign";
  return (
    <button
      onClick={onClick}
      className="h-8 min-w-[96px] px-4 rounded-xl text-[13px] font-normal tracking-tight bg-[var(--color-brand-8)] text-[var(--color-brand)] hover:bg-[var(--color-brand-20)] transition-colors cursor-pointer"
    >
      {label}
    </button>
  );
}

const GRID =
  "grid-cols-[minmax(220px,1.6fr)_minmax(180px,1.2fr)_minmax(150px,1fr)_minmax(110px,0.9fr)_minmax(120px,0.9fr)_110px_96px]";

export default function AgreementsTable({
  rows,
  onAction,
  onViewRequest,
  sortState = null,
  onSortChange,
}: AgreementsTableProps) {
  const renderHeader = (
    col: AgreementColumnId,
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

  return (
    // Vertical scrolling is owned by the page-level scroll container in
    // `DashboardLayout`. Here we only enable horizontal scroll on desktop so
    // the wide grid (≥1120px min-width) can scroll within the page when the
    // viewport is narrower than the table. Mobile rows fit naturally and need
    // no overflow handling.
    <div className="w-full md:overflow-x-auto md:bg-[var(--color-bg-surface)] md:rounded-lg md:border md:border-[var(--color-border)]">
      <div className="flex flex-col md:min-w-[1120px]">
        {/* Desktop header — hidden on mobile (the mobile rows speak for
            themselves with stacked labels). Scrolls with the page; the
            page-level sticky tabs already pin to the top. */}
        <div
          className={`hidden md:grid ${GRID} gap-4 items-center px-3 py-2 border-b border-[var(--color-border)]`}
        >
          {renderHeader("type", "Type")}
          {/* Order type — non-sortable. Mirrors SortableHeader's typography +
              padding so the column data lines up. */}
          <div className="flex items-center">
            <span className="h-7 inline-flex items-center px-1.5 text-sm font-medium tracking-tight text-[var(--color-text-secondary)]">
              Order type
            </span>
          </div>
          {renderHeader("issueDate", "Issue / Due date")}
          {renderHeader("signingDate", "Signing date")}
          {renderHeader("amount", "Total amount", "right")}
          {/* Status — non-sortable. Mirrors SortableHeader's typography +
              padding so the column data lines up. */}
          <div className="flex items-center justify-center">
            <span className="h-7 inline-flex items-center px-1.5 text-sm font-medium tracking-tight text-[var(--color-text-secondary)]">
              Status
            </span>
          </div>
          <div />
        </div>

        {rows.map((row) => (
          <Fragment key={row.id}>
            {/* Desktop row */}
            <div
              className={`hidden md:grid ${GRID} gap-4 items-center px-3 h-[52px] border-b border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] transition-colors shrink-0`}
            >
              <div className="flex items-center gap-3 min-w-0 px-1.5">
                <div className="size-9 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-icon-default)] flex items-center justify-center shrink-0">
                  <FileEdit size={16} />
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

              <div className="text-sm min-w-0 truncate px-1.5">
                {row.orderType ? (
                  onViewRequest ? (
                    <button
                      type="button"
                      onClick={() => onViewRequest(extractReference(row.orderType!))}
                      className="text-[var(--color-brand)] hover:underline cursor-pointer truncate text-left"
                    >
                      {row.orderType}
                    </button>
                  ) : (
                    <span className="text-[var(--color-brand)]">{row.orderType}</span>
                  )
                ) : (
                  <span className="text-[var(--color-text-secondary)]">—</span>
                )}
              </div>

              <div className="text-sm text-[var(--color-text-primary)] px-1.5">
                {row.issueDate} / {row.dueDate ?? "—"}
              </div>

              <div className="text-sm text-[var(--color-text-primary)] px-1.5">
                {row.signingDate ?? (
                  <span className="text-[var(--color-text-secondary)]">—</span>
                )}
              </div>

              <div className="text-sm font-semibold text-[var(--color-text-primary)] text-right tabular-nums px-1.5">
                {row.amount ? (
                  row.paidAmount ? (
                    <>
                      <span className="text-[var(--color-text-secondary)] font-normal">
                        {row.paidAmount} /{" "}
                      </span>
                      {row.amount}
                    </>
                  ) : (
                    row.amount
                  )
                ) : (
                  <span className="text-[var(--color-text-secondary)] font-normal">—</span>
                )}
              </div>

              <div className="flex items-center justify-center px-1.5">
                <StatusCell status={row.status} label={row.statusLabel} />
              </div>

              <div className="flex items-center justify-end">
                <ActionButton action={row.action} onClick={() => onAction?.(row)} />
              </div>
            </div>

            {/* Mobile row — collapses the 7-column grid into a two-column
                stacked layout (type + customer on the left, amount + status on
                the right). Tap anywhere on the row to fire the same action the
                "Sign / Sign & Pay / View" button would on desktop. */}
            <button
              type="button"
              onClick={() => onAction?.(row)}
              className="md:hidden w-full flex items-center justify-between gap-6 pl-3 pr-2 py-2 min-h-[52px] border-b border-[var(--color-border)] hover:bg-[var(--color-bg-surface)] transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="size-9 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] text-[var(--color-icon-default)] flex items-center justify-center shrink-0">
                  <FileEdit size={16} />
                </div>
                <div className="flex flex-col gap-1 min-w-0">
                  <span className="text-sm text-[var(--color-text-primary)] truncate leading-tight">
                    {row.type}
                  </span>
                  <span className="text-sm text-[var(--color-text-secondary)] truncate leading-tight">
                    {row.customer}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1 items-end shrink-0">
                <span className="text-sm text-[var(--color-text-primary)] tabular-nums leading-none">
                  {row.amount ? (
                    row.paidAmount ? (
                      <>
                        <span className="text-[var(--color-text-secondary)]">
                          {row.paidAmount} /{" "}
                        </span>
                        {row.amount}
                      </>
                    ) : (
                      row.amount
                    )
                  ) : (
                    <span className="text-[var(--color-text-secondary)]">—</span>
                  )}
                </span>
                <StatusCell status={row.status} label={row.statusLabel} />
              </div>
            </button>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

