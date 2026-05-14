import { useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { SlidersHorizontal, RefreshCw, CalendarX, Clock, Columns3, Eye, EyeClosed, Search } from "lucide-react";
import type { SummaryCardTone } from "../shared/SummaryCard";
import FilterPopover from "../shared/FilterPopover";
import Popover from "../shared/Popover";
import {
  AmountInput,
  CheckRow,
  DateFieldGroup,
  PresetMenu,
  detectPreset,
  presetRange,
} from "../shared/FilterFields";
import DashboardLayout from "../layout/DashboardLayout";
import BrandLogo from "../shared/BrandLogo";
import SidebarCTA from "../shared/SidebarCTA";
import SearchBar from "../shared/SearchBar";
import Tabs from "../shared/Tabs";
import { type SortState } from "../shared/SortableHeader";
import FilterSlideout, {
  emptyFilters,
  applyFilters,
  type FilterState,
  type FilterTab,
  type PaymentTypeFilter,
  type InvoiceTypeFilter,
  type StatusFilter,
} from "../shared/FilterSlideout";
import PaymentsTable, {
  ALL_PAYMENT_COLUMNS,
  LOCKED_PAYMENT_COLUMNS,
  PAYMENT_COLUMN_LABELS,
  defaultPaymentColumnVisibility,
  type PaymentColumnVisibility,
} from "../tables/PaymentsTable";
import SummaryCard from "../shared/SummaryCard";
import BulkSelectBar from "../shared/BulkSelectBar";
import PaymentModal from "../shared/PaymentModal";
import AgreementModal from "../shared/AgreementModal";
import Toast from "../shared/Toast";
import {
  paymentsNavItems,
  paymentSummaryCards,
  paymentRows,
  type PaymentRow,
  type PaymentType,
  type PaymentSummaryFilter,
  type PageId,
} from "../../data/mockData";

const tabs = [
  { id: "all", label: "All" },
  { id: "requests", label: "Requests" },
  { id: "invoices", label: "Invoices" },
];

const paymentSummaryMeta: Record<
  string,
  { icon: typeof RefreshCw; tone: SummaryCardTone }
> = {
  outstanding: { icon: RefreshCw, tone: "default" },
  overdue: { icon: CalendarX, tone: "danger" },
  "due-soon": { icon: Clock, tone: "warning" },
};

const requestTypes: PaymentType[] = ["Payment request", "Payment request (partial)"];
const invoiceTypes: PaymentType[] = ["Invoice", "Invoice (partial)"];

// Dates are MM-DD-YY, YY ∈ 20xx.
function parseIssueDate(s: string): number {
  const [mm, dd, yy] = s.split("-").map((p) => parseInt(p, 10));
  return new Date(2000 + yy, mm - 1, dd).getTime();
}

function compareByKey(a: PaymentRow, b: PaymentRow, key: string): number {
  switch (key) {
    case "type":
      // The visible secondary text is the customer/business name — sort by
      // that, falling back to the raw type when customers tie.
      return (
        a.customer.localeCompare(b.customer) || a.type.localeCompare(b.type)
      );
    case "reference":
      return a.reference.localeCompare(b.reference);
    case "date":
      return parseIssueDate(a.issueDate) - parseIssueDate(b.issueDate);
    case "amount":
      return parseAmount(a.amount) - parseAmount(b.amount);
    case "status":
      return (a.statusLabel ?? a.status).localeCompare(
        b.statusLabel ?? b.status,
      );
    default:
      return 0;
  }
}

function sortRows(rows: PaymentRow[], state: SortState | null): PaymentRow[] {
  // Default order when no column is actively sorted: newest issue date first.
  if (!state) {
    return [...rows].sort(
      (a, b) => parseIssueDate(b.issueDate) - parseIssueDate(a.issueDate),
    );
  }
  const sign = state.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => sign * compareByKey(a, b, state.key));
}

function matchesSummary(row: PaymentRow, filter: PaymentSummaryFilter): boolean {
  if (filter === "outstanding") return row.status !== "paid";
  if (filter === "overdue") return row.status === "overdue";
  if (filter === "due-soon") return row.status === "due-soon";
  return true;
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/[$,]/g, "")) || 0;
}

function formatAmount(n: number): string {
  return `$${n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

// ============================================================================
// Filter dropdown helpers
// ============================================================================

type SetFilters = Dispatch<SetStateAction<FilterState>>;

function amountLabel(f: FilterState): string {
  if (!f.totalMin && !f.totalMax) return "Amount";
  if (f.totalMin && f.totalMax) return `$${f.totalMin} – $${f.totalMax}`;
  if (f.totalMin) return `$${f.totalMin}+`;
  return `Up to $${f.totalMax}`;
}

function toggleInArray<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

function togglePaymentType(setFilters: SetFilters, value: PaymentTypeFilter) {
  setFilters((f) => ({ ...f, paymentTypes: toggleInArray(f.paymentTypes, value) }));
}

function toggleInvoiceType(setFilters: SetFilters, value: InvoiceTypeFilter) {
  setFilters((f) => ({ ...f, invoiceTypes: toggleInArray(f.invoiceTypes, value) }));
}

function toggleStatus(setFilters: SetFilters, value: StatusFilter) {
  setFilters((f) => ({ ...f, statuses: toggleInArray(f.statuses, value) }));
}

// Menu-item row used by the customize-columns popover. Matches the Figma
// "Columns" menu items: 42px tall, rounded-xl, hover-surface bg, 14px label
// on the left, eye/closed-eye icon on the right that toggles visibility.
// Locked rows (e.g. Type, Total amount) render as static — no icon, no hover,
// no click — so the user knows those columns can't be hidden.
function ColumnToggleRow({
  label,
  visible,
  locked = false,
  onToggle,
}: {
  label: string;
  visible: boolean;
  locked?: boolean;
  onToggle: () => void;
}) {
  if (locked) {
    return (
      <div
        aria-disabled
        className="w-full flex items-center gap-3 h-[42px] pl-4 pr-3 rounded-xl text-left"
      >
        <span className="flex-1 min-w-0 text-sm tracking-tight text-[var(--color-text-tertiary)] truncate">
          {label}
        </span>
      </div>
    );
  }
  const Icon = visible ? Eye : EyeClosed;
  return (
    <button
      type="button"
      role="menuitemcheckbox"
      aria-checked={visible}
      onClick={onToggle}
      className="w-full flex items-center gap-3 h-[42px] pl-4 pr-3 rounded-xl text-left hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
    >
      <span className="flex-1 min-w-0 text-sm tracking-tight text-[var(--color-text-primary)] truncate">
        {label}
      </span>
      <Icon
        size={20}
        className={`shrink-0 ${
          visible
            ? "text-[var(--color-icon-secondary)]"
            : "text-[var(--color-text-tertiary)]"
        }`}
      />
    </button>
  );
}

interface PaymentsPageProps {
  onNavigate?: (pageId: PageId) => void;
  onLogout?: () => void;
  onViewRequest?: (reference: string) => void;
}

export default function PaymentsPage({
  onNavigate,
  onLogout,
  onViewRequest,
}: PaymentsPageProps = {}) {
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState<FilterState>(emptyFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [summaryFilter, setSummaryFilter] = useState<PaymentSummaryFilter | null>(null);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [paying, setPaying] = useState<{ customer: string; amount: string } | null>(null);
  const [signing, setSigning] = useState<{ customer: string; amount: string } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [columnVisibility, setColumnVisibility] = useState<PaymentColumnVisibility>(
    defaultPaymentColumnVisibility,
  );
  // On tablet (md→lg) the search bar collapses to an icon button. Clicking it
  // expands the input inline; if the user blurs it without typing anything,
  // it auto-collapses back to the icon.
  const [tabletSearchOpen, setTabletSearchOpen] = useState(false);

  const displayedRows = useMemo(() => {
    let rows = paymentRows;

    // Tab
    if (activeTab === "requests") {
      rows = rows.filter((r) => requestTypes.includes(r.type));
    } else if (activeTab === "invoices") {
      rows = rows.filter((r) => invoiceTypes.includes(r.type));
    }

    // Search (customer name + reference no.), case-insensitive
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.customer.toLowerCase().includes(q) ||
          r.reference.toLowerCase().includes(q)
      );
    }

    // Summary card filter
    if (summaryFilter) {
      rows = rows.filter((r) => matchesSummary(r, summaryFilter));
    }

    // Filter panel
    rows = applyFilters(rows, filters);

    return sortRows(rows, sortState);
  }, [activeTab, sortState, search, filters, summaryFilter]);

  const { selectionCount, selectionTotal, multiCustomer, needsSign } = useMemo(() => {
    const selectedRows = paymentRows.filter((r) => selected[r.reference]);
    const total = selectedRows.reduce((sum, r) => sum + parseAmount(r.amount), 0);
    const distinctCustomers = new Set(selectedRows.map((r) => r.customer));
    return {
      selectionCount: selectedRows.length,
      selectionTotal: formatAmount(total),
      multiCustomer: distinctCustomers.size > 1,
      needsSign: selectedRows.some((r) => r.action === "sign-pay"),
    };
  }, [selected]);

  return (
    <DashboardLayout
      logo={<BrandLogo />}
      navItems={paymentsNavItems}
      sidebarFooter={<SidebarCTA onGetStarted={() => onNavigate?.("merchant-signup")} />}
      showLogout={false}
      onNavigate={onNavigate}
      onLogout={onLogout}
      topBarLeft={
        <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)] flex-1 min-w-0">
          Payments
        </h1>
      }
    >
      {/* Summary cards */}
      <div className="flex gap-3 shrink-0 overflow-x-auto scrollbar-hide">
        {paymentSummaryCards.map((card) => {
          const meta = paymentSummaryMeta[card.id] ?? paymentSummaryMeta.outstanding;
          return (
            <SummaryCard
              key={card.id}
              label={card.label}
              count={card.count}
              total={card.total}
              icon={meta.icon}
              tone={meta.tone}
              selected={summaryFilter === card.id}
              onClick={() =>
                setSummaryFilter((current) => (current === card.id ? null : card.id))
              }
            />
          );
        })}
      </div>

      {/* Tabs are sticky at every breakpoint so the All/Requests/Invoices
          switcher stays pinned at the top of the page-level scroll while the
          overview cards scroll out of view. The solid page-color background
          covers content scrolling underneath. */}
    <Tabs
      tabs={tabs}
      activeId={activeTab}
      onChange={(id) => setActiveTab(id as FilterTab)}
    />

      {/* Toolbar — on mobile we collapse the chip row + columns toggle and
          surface a single Filters slide-out button instead. */}
      <div className="flex items-center justify-between gap-3">
        {/* Filter chip row — desktop only. Horizontal scroll on narrow viewports. */}
        <div className="hidden md:flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-hide">
          {/* Amount — From/To range, matches Figma "filter-dropdown-amount" */}
          <FilterPopover
            label={amountLabel(filters)}
            selected={!!filters.totalMin || !!filters.totalMax}
            onClear={() =>
              setFilters((f) => ({ ...f, totalMin: "", totalMax: "" }))
            }
            panelClassName="w-80 p-6 flex flex-col gap-2"
          >
            {() => (
              <>
                <span className="text-sm font-medium tracking-tight text-[var(--color-text-secondary)]">
                  Total
                </span>
                <div className="flex flex-col gap-2">
                  <AmountInput
                    placeholder="From"
                    value={filters.totalMin}
                    onChange={(v) => setFilters((f) => ({ ...f, totalMin: v }))}
                  />
                  <AmountInput
                    placeholder="To"
                    value={filters.totalMax}
                    onChange={(v) => setFilters((f) => ({ ...f, totalMax: v }))}
                  />
                </div>
              </>
            )}
          </FilterPopover>

          {/* Type — payment type + invoice type */}
          <FilterPopover
            label="Type"
            selected={
              filters.paymentTypes.length > 0 || filters.invoiceTypes.length > 0
            }
            onClear={() =>
              setFilters((f) => ({ ...f, paymentTypes: [], invoiceTypes: [] }))
            }
            panelClassName="w-80 p-2 flex flex-col"
          >
            {() => (
              <>
                <CheckRow
                  label="One payment"
                  checked={filters.paymentTypes.includes("one")}
                  onToggle={() => togglePaymentType(setFilters, "one")}
                />
                <CheckRow
                  label="Partial payment"
                  checked={filters.paymentTypes.includes("partial")}
                  onToggle={() => togglePaymentType(setFilters, "partial")}
                />
                <div className="h-px bg-[var(--color-border)] mx-2 my-1" />
                <CheckRow
                  label="Invoice"
                  checked={filters.invoiceTypes.includes("invoice")}
                  onToggle={() => toggleInvoiceType(setFilters, "invoice")}
                />
                <CheckRow
                  label="Estimate"
                  checked={filters.invoiceTypes.includes("estimate")}
                  onToggle={() => toggleInvoiceType(setFilters, "estimate")}
                />
              </>
            )}
          </FilterPopover>

          {/* Status */}
          <FilterPopover
            label={
              filters.statuses.length > 0
                ? `Status (${filters.statuses.length})`
                : "Status"
            }
            selected={filters.statuses.length > 0}
            onClear={() => setFilters((f) => ({ ...f, statuses: [] }))}
            panelClassName="w-80 p-2 flex flex-col"
          >
            {() => (
              <>
                {(
                  [
                    ["overdue", "Overdue"],
                    ["due-soon", "Due soon"],
                    ["pending", "Pending"],
                    ["paid", "Paid"],
                  ] as [StatusFilter, string][]
                ).map(([id, label]) => (
                  <CheckRow
                    key={id}
                    label={label}
                    checked={filters.statuses.includes(id)}
                    onToggle={() => toggleStatus(setFilters, id)}
                  />
                ))}
              </>
            )}
          </FilterPopover>

          {/* Date — preset + From/To range, matches Figma "filter-dropdown-merchant" (date) */}
          <FilterPopover
            label="Date"
            selected={!!filters.dateFrom || !!filters.dateTo}
            onClear={() =>
              setFilters((f) => ({ ...f, dateFrom: "", dateTo: "" }))
            }
            panelClassName="w-80 p-6 flex flex-col gap-8"
          >
            {() => (
              <>
                <div className="flex flex-col gap-2">
                  <span className="text-sm font-medium tracking-tight text-[var(--color-text-secondary)]">
                    Show payments for
                  </span>
                  <PresetMenu
                    value={detectPreset(filters.dateFrom, filters.dateTo)}
                    onChange={(p) => {
                      const { from, to } = presetRange(p);
                      if (p === "custom") return; // leave existing values for editing
                      setFilters((f) => ({ ...f, dateFrom: from, dateTo: to }));
                    }}
                  />
                </div>
                <div className="flex flex-col gap-4">
                  <DateFieldGroup
                    label="From"
                    value={filters.dateFrom}
                    onChange={(v) => setFilters((f) => ({ ...f, dateFrom: v }))}
                  />
                  <DateFieldGroup
                    label="To"
                    placeholder="Today"
                    value={filters.dateTo}
                    onChange={(v) => setFilters((f) => ({ ...f, dateTo: v }))}
                  />
                </div>
              </>
            )}
          </FilterPopover>
        </div>

        {/* Right side — columns toggle (desktop) + search; slide-out button on mobile. */}
        <div className="flex flex-1 items-center gap-2 md:flex-none md:shrink-0">
          <div className="hidden md:block">
            <Popover
              align="end"
              panelClassName="w-80 p-2 flex flex-col"
              trigger={({ open, toggle }) => (
                <button
                  type="button"
                  aria-label="Customize columns"
                  aria-expanded={open}
                  onClick={toggle}
                  className={`shrink-0 size-11 rounded-2xl bg-[var(--color-bg-surface)] border flex items-center justify-center transition-colors cursor-pointer focus-visible:outline-none ${
                    open
                      ? "border-[var(--color-border-focus)] text-[var(--color-text-primary)]"
                      : "border-[var(--color-border)] text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] active:bg-[var(--color-bg-surface)] active:border-[var(--color-border-strong)] focus-visible:border-[var(--color-border-focus)]"
                  }`}
                >
                  <Columns3 size={20} />
                </button>
              )}
            >
              {() =>
                ALL_PAYMENT_COLUMNS.map((col) => {
                  const locked = LOCKED_PAYMENT_COLUMNS.has(col);
                  return (
                    <ColumnToggleRow
                      key={col}
                      label={PAYMENT_COLUMN_LABELS[col]}
                      visible={columnVisibility[col]}
                      locked={locked}
                      onToggle={
                        locked
                          ? () => {}
                          : () =>
                              setColumnVisibility((cv) => ({
                                ...cv,
                                [col]: !cv[col],
                              }))
                      }
                    />
                  );
                })
              }
            </Popover>
          </div>
          {/* Tablet (md→lg): collapse search to an icon button when not in
              use. At lg+ the icon disappears and the bar is always visible. */}
          {!tabletSearchOpen && (
            <button
              type="button"
              aria-label="Search"
              onClick={() => setTabletSearchOpen(true)}
              className="hidden md:flex lg:hidden shrink-0 size-11 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] items-center justify-center text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] active:bg-[var(--color-bg-surface)] active:border-[var(--color-border-strong)] focus-visible:outline-none focus-visible:border-[var(--color-border-focus)] transition-colors cursor-pointer"
            >
              <Search size={20} />
            </button>
          )}
          <SearchBar
            placeholder="Search by business or reference"
            value={search}
            onChange={setSearch}
            autoFocus={tabletSearchOpen}
            onBlur={() => {
              if (!search) setTabletSearchOpen(false);
            }}
            className={`flex-1 ${
              tabletSearchOpen ? "md:flex md:w-72 md:flex-none" : "md:hidden"
            } lg:flex lg:w-80 lg:flex-none`}
          />
          <button
            onClick={() => setFiltersOpen(true)}
            className="size-11 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] active:bg-[var(--color-bg-surface)] active:border-[var(--color-border-strong)] focus-visible:outline-none focus-visible:border-[var(--color-border-focus)] transition-colors cursor-pointer shrink-0 md:hidden"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>
      </div>

      {/* Table flows in normal layout — vertical scrolling is handled by the
          page-level scroll container in `DashboardLayout`. */}
      <div>
        <PaymentsTable
          rows={displayedRows}
          selected={selected}
          onSelectedChange={setSelected}
          columnVisibility={columnVisibility}
          sortState={sortState}
          onSortChange={setSortState}
          onRowClick={(row) => onViewRequest?.(row.reference)}
          onPayRow={(row) => {
            const info = { customer: row.customer, amount: row.amount };
            if (row.action === "sign-pay") {
              setSigning(info);
            } else {
              setPaying(info);
            }
          }}
        />
      </div>

      <FilterSlideout
        open={filtersOpen}
        tab={activeTab}
        value={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={setFilters}
      />

      <BulkSelectBar
        count={selectionCount}
        total={selectionTotal}
        disabled={multiCustomer}
        payLabel={needsSign ? "Sign & Pay" : "Pay"}
        onCancel={() => setSelected({})}
        onPay={() => {
          const rows = paymentRows.filter((r) => selected[r.reference]);
          if (rows.length === 0) return;
          const total = rows.reduce((sum, r) => sum + parseAmount(r.amount), 0);
          const info = {
            customer: rows[0].customer,
            amount: formatAmount(total),
          };
          if (rows.some((r) => r.action === "sign-pay")) {
            setSigning(info);
          } else {
            setPaying(info);
          }
        }}
      />

      <AgreementModal
        open={signing !== null}
        customer={signing?.customer ?? ""}
        onClose={() => setSigning(null)}
        onComplete={() => {
          const info = signing;
          setSigning(null);
          if (info) setPaying(info);
        }}
      />

      <PaymentModal
        open={paying !== null}
        onClose={() => setPaying(null)}
        onPay={() => {
          const amount = paying?.amount ?? "";
          setPaying(null);
          setSelected({});
          setSuccessToast(`Payment of ${amount} sent`);
        }}
        customer={paying?.customer ?? ""}
        amount={paying?.amount ?? ""}
      />

      <Toast
        open={successToast !== null}
        message={successToast ?? ""}
        onClose={() => setSuccessToast(null)}
      />
    </DashboardLayout>
  );
}
