import { useMemo, useState } from "react";
import { SlidersHorizontal, RefreshCw, CalendarX, Clock, Search } from "lucide-react";
import type { SummaryCardTone } from "../shared/SummaryCard";
import DashboardLayout from "../layout/DashboardLayout";
import BrandLogo from "../shared/BrandLogo";
import SidebarCTA from "../shared/SidebarCTA";
import SearchBar from "../shared/SearchBar";
import Tabs from "../shared/Tabs";
import FilterPopover from "../shared/FilterPopover";
import { type SortState } from "../shared/SortableHeader";
import {
  AmountInput,
  DateFieldGroup,
  PresetMenu,
  detectPreset,
  presetRange,
} from "../shared/FilterFields";
import AgreementsFilterSlideout, {
  emptyAgreementsFilters,
  applyAgreementFilters,
  type AgreementsFilterState,
  type AgreementsFilterTab,
} from "../shared/AgreementsFilterSlideout";
import AgreementsTable from "../tables/AgreementsTable";
import SummaryCard from "../shared/SummaryCard";
import AgreementModal from "../shared/AgreementModal";
import SignedAgreementModal from "../shared/SignedAgreementModal";
import PaymentModal from "../shared/PaymentModal";
import Toast from "../shared/Toast";
import {
  agreementsNavItems,
  agreementSummaryCards,
  agreementRows,
  type AgreementRow,
  type AgreementSummaryFilter,
  type PageId,
} from "../../data/mockData";

const tabs = [
  { id: "all", label: "All" },
  { id: "to-sign", label: "To sign" },
  { id: "signed", label: "Signed" },
];

const agreementSummaryMeta: Record<
  string,
  { icon: typeof RefreshCw; tone: SummaryCardTone }
> = {
  "awaiting-signature": { icon: RefreshCw, tone: "default" },
  overdue: { icon: CalendarX, tone: "danger" },
  "due-soon": { icon: Clock, tone: "warning" },
};

function parseIssueDate(s: string): number {
  const [mm, dd, yy] = s.split("-").map((p) => parseInt(p, 10));
  return new Date(2000 + yy, mm - 1, dd).getTime();
}

function parseDateOrNull(s: string | null): number | null {
  if (!s) return null;
  return parseIssueDate(s);
}

function sortByNewest(rows: AgreementRow[]): AgreementRow[] {
  return [...rows].sort(
    (a, b) => parseIssueDate(b.issueDate) - parseIssueDate(a.issueDate),
  );
}

/** Compare two rows by a sort key. Nulls always sort last regardless of dir. */
function compareByKey(a: AgreementRow, b: AgreementRow, key: string): number {
  switch (key) {
    case "type":
      return a.type.localeCompare(b.type);
    case "issueDate":
      return parseIssueDate(a.issueDate) - parseIssueDate(b.issueDate);
    case "signingDate": {
      const av = parseDateOrNull(a.signingDate);
      const bv = parseDateOrNull(b.signingDate);
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return av - bv;
    }
    case "amount": {
      const av = a.amount ? parseFloat(a.amount.replace(/[$,]/g, "")) : null;
      const bv = b.amount ? parseFloat(b.amount.replace(/[$,]/g, "")) : null;
      if (av === null && bv === null) return 0;
      if (av === null) return 1;
      if (bv === null) return -1;
      return av - bv;
    }
    default:
      return 0;
  }
}

function applySort(rows: AgreementRow[], state: SortState | null): AgreementRow[] {
  if (!state) return sortByNewest(rows);
  const sign = state.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => sign * compareByKey(a, b, state.key));
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/[$,]/g, "")) || 0;
}

function formatAmount(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}

function amountLabel(min: string, max: string): string {
  const minN = min ? parseAmount(min) : null;
  const maxN = max ? parseAmount(max) : null;
  if (minN !== null && maxN !== null)
    return `$${formatAmount(minN)} – $${formatAmount(maxN)}`;
  if (minN !== null) return `From $${formatAmount(minN)}`;
  if (maxN !== null) return `Up to $${formatAmount(maxN)}`;
  return "Amount";
}

function matchesSummary(row: AgreementRow, filter: AgreementSummaryFilter): boolean {
  // "Awaiting signature" covers anything not yet signed — plain "to-sign" rows
  // plus "due-soon"/"overdue" rows that still need a sign-and-pay. Matches the
  // count shown on the summary card.
  if (filter === "awaiting-signature") return row.status !== "signed";
  if (filter === "overdue") return row.status === "overdue";
  if (filter === "due-soon") return row.status === "due-soon";
  return true;
}

interface AgreementsPageProps {
  onNavigate?: (pageId: PageId) => void;
  onLogout?: () => void;
  onViewRequest?: (reference: string) => void;
}

export default function AgreementsPage({
  onNavigate,
  onLogout,
  onViewRequest,
}: AgreementsPageProps = {}) {
  const [activeTab, setActiveTab] = useState<AgreementsFilterTab>("all");
  const [search, setSearch] = useState("");
  const [tabletSearchOpen, setTabletSearchOpen] = useState(false);
  const [sortState, setSortState] = useState<SortState | null>(null);
  const [filters, setFilters] = useState<AgreementsFilterState>(emptyAgreementsFilters);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [summaryFilter, setSummaryFilter] = useState<AgreementSummaryFilter | null>(null);
  const [signing, setSigning] = useState<{
    customer: string;
    amount: string;
    needsPayment: boolean;
  } | null>(null);
  const [paying, setPaying] = useState<{ customer: string; amount: string } | null>(null);
  const [viewing, setViewing] = useState<AgreementRow | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const displayedRows = useMemo(() => {
    let rows = agreementRows;

    if (activeTab === "to-sign") {
      rows = rows.filter((r) => r.status !== "signed");
    } else if (activeTab === "signed") {
      rows = rows.filter((r) => r.status === "signed");
    }

    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter(
        (r) =>
          r.customer.toLowerCase().includes(q) ||
          r.type.toLowerCase().includes(q) ||
          (r.orderType ?? "").toLowerCase().includes(q)
      );
    }

    if (summaryFilter) {
      rows = rows.filter((r) => matchesSummary(r, summaryFilter));
    }

    rows = applyAgreementFilters(rows, filters);

    return applySort(rows, sortState);
  }, [activeTab, search, filters, summaryFilter, sortState]);

  return (
    <DashboardLayout
      logo={<BrandLogo />}
      navItems={agreementsNavItems}
      sidebarFooter={<SidebarCTA onGetStarted={() => onNavigate?.("merchant-signup")} />}
      showLogout={false}
      onNavigate={onNavigate}
      onLogout={onLogout}
      topBarLeft={
        <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)] flex-1 min-w-0">
          Agreements
        </h1>
      }
    >
      {/* Summary cards */}
      <div className="flex gap-3 shrink-0 overflow-x-auto scrollbar-hide">
        {agreementSummaryCards.map((card) => {
          const meta =
            agreementSummaryMeta[card.id] ?? agreementSummaryMeta["awaiting-signature"];
          return (
            <SummaryCard
              key={card.id}
              label={card.label}
              count={card.count}
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

      {/* Tabs are sticky at every breakpoint so the All/To sign/Signed
          switcher stays pinned at the top of the page-level scroll while the
          overview cards scroll out of view. The solid page-color background
          covers content scrolling underneath. */}
      <div className="sticky top-0 z-20 bg-[var(--color-bg-page)]">
        <Tabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as AgreementsFilterTab)} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        {/* Filter chip row — desktop only. Horizontal scroll on narrow viewports. */}
        <div className="hidden md:flex items-center gap-2 min-w-0 overflow-x-auto scrollbar-hide">
          {/* Amount */}
          <FilterPopover
            label={amountLabel(filters.totalMin, filters.totalMax)}
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
                    onChange={(v) =>
                      setFilters((f) => ({ ...f, totalMin: v }))
                    }
                  />
                  <AmountInput
                    placeholder="To"
                    value={filters.totalMax}
                    onChange={(v) =>
                      setFilters((f) => ({ ...f, totalMax: v }))
                    }
                  />
                </div>
              </>
            )}
          </FilterPopover>


          {/* Issue date */}
          <DateRangeFilter
            label="Issue date"
            menuLabel="Show agreements for"
            from={filters.issueDateFrom}
            to={filters.issueDateTo}
            onChange={(from, to) =>
              setFilters((f) => ({
                ...f,
                issueDateFrom: from,
                issueDateTo: to,
              }))
            }
          />

          {/* Due date */}
          <DateRangeFilter
            label="Due date"
            menuLabel="Show agreements due"
            from={filters.dueDateFrom}
            to={filters.dueDateTo}
            onChange={(from, to) =>
              setFilters((f) => ({
                ...f,
                dueDateFrom: from,
                dueDateTo: to,
              }))
            }
          />

          {/* Signing date */}
          <DateRangeFilter
            label="Signing date"
            menuLabel="Show agreements signed"
            from={filters.signingDateFrom}
            to={filters.signingDateTo}
            onChange={(from, to) =>
              setFilters((f) => ({
                ...f,
                signingDateFrom: from,
                signingDateTo: to,
              }))
            }
          />
        </div>

        {/* Right side — search; slide-out button on mobile. Tablet (md→lg)
            collapses search to an icon that expands inline when clicked. At
            lg+ the icon disappears and the bar is always visible. */}
        <div className="flex flex-1 items-center gap-2 md:flex-none md:shrink-0">
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
        <AgreementsTable
          rows={displayedRows}
          sortState={sortState}
          onSortChange={setSortState}
          onAction={(row) => {
            if (row.action === "view") {
              setViewing(row);
              return;
            }
            setSigning({
              customer: row.customer,
              amount: row.amount ?? "",
              needsPayment: row.action === "sign-pay",
            });
          }}
          onViewRequest={onViewRequest}
        />
      </div>

      <AgreementsFilterSlideout
        open={filtersOpen}
        value={filters}
        onClose={() => setFiltersOpen(false)}
        onApply={setFilters}
      />

      <AgreementModal
        open={signing !== null}
        customer={signing?.customer ?? ""}
        continueToPayment={signing?.needsPayment ?? false}
        onClose={() => setSigning(null)}
        onComplete={() => {
          const info = signing;
          setSigning(null);
          if (!info) return;
          if (info.needsPayment) {
            setPaying({ customer: info.customer, amount: info.amount });
          } else {
            setSuccessToast("Agreement signed");
          }
        }}
      />

      <PaymentModal
        open={paying !== null}
        onClose={() => setPaying(null)}
        onPay={() => {
          const amount = paying?.amount ?? "";
          setPaying(null);
          setSuccessToast(`Payment of ${amount} sent`);
        }}
        customer={paying?.customer ?? ""}
        amount={paying?.amount ?? ""}
      />

      <SignedAgreementModal
        open={viewing !== null}
        merchant={viewing?.customer ?? ""}
        agreementType={viewing?.type ?? ""}
        signingDate={viewing?.signingDate ?? null}
        amount={viewing?.amount ?? null}
        onClose={() => setViewing(null)}
      />

      <Toast
        open={successToast !== null}
        message={successToast ?? ""}
        onClose={() => setSuccessToast(null)}
      />
    </DashboardLayout>
  );
}

/**
 * Date-range filter chip that wraps a preset menu + From/To date pair. Used
 * for Issue date / Due date / Signing date — the three date filters share an
 * identical UI; only the underlying state slot differs.
 */
function DateRangeFilter({
  label,
  menuLabel,
  from,
  to,
  onChange,
}: {
  label: string;
  menuLabel: string;
  from: string;
  to: string;
  onChange: (from: string, to: string) => void;
}) {
  return (
    <FilterPopover
      label={label}
      selected={!!from || !!to}
      onClear={() => onChange("", "")}
      panelClassName="w-80 p-6 flex flex-col gap-8"
    >
      {() => (
        <>
          <div className="flex flex-col gap-2">
            <span className="text-sm font-medium tracking-tight text-[var(--color-text-secondary)]">
              {menuLabel}
            </span>
            <PresetMenu
              value={detectPreset(from, to)}
              onChange={(p) => {
                if (p === "custom") return;
                const r = presetRange(p);
                onChange(r.from, r.to);
              }}
            />
          </div>
          <div className="flex flex-col gap-4">
            <DateFieldGroup
              label="From"
              value={from}
              onChange={(v) => onChange(v, to)}
            />
            <DateFieldGroup
              label="To"
              placeholder="Today"
              value={to}
              onChange={(v) => onChange(from, v)}
            />
          </div>
        </>
      )}
    </FilterPopover>
  );
}
