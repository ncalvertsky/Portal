import { useMemo, useState } from "react";
import { SlidersHorizontal, RefreshCw, CalendarX, Clock } from "lucide-react";
import type { SummaryCardTone } from "../shared/SummaryCard";
import DashboardLayout from "../layout/DashboardLayout";
import BrandLogo from "../shared/BrandLogo";
import SidebarCTA from "../shared/SidebarCTA";
import SearchBar from "../shared/SearchBar";
import Tabs from "../shared/Tabs";
import SortDropdown, { type SortOption } from "../shared/SortDropdown";
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

type SortId = "newest" | "oldest";

const sortOptions: SortOption<SortId>[] = [
  { id: "newest", label: "Newest first" },
  { id: "oldest", label: "Oldest first" },
];

function parseIssueDate(s: string): number {
  const [mm, dd, yy] = s.split("-").map((p) => parseInt(p, 10));
  return new Date(2000 + yy, mm - 1, dd).getTime();
}

function sortRows(rows: AgreementRow[], sort: SortId): AgreementRow[] {
  const copy = [...rows];
  return copy.sort((a, b) => {
    const diff = parseIssueDate(a.issueDate) - parseIssueDate(b.issueDate);
    return sort === "oldest" ? diff : -diff;
  });
}

const uniqueMerchants = Array.from(new Set(agreementRows.map((r) => r.customer)));

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
  const [sort, setSort] = useState<SortId>("newest");
  const [search, setSearch] = useState("");
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

    return sortRows(rows, sort);
  }, [activeTab, sort, search, filters, summaryFilter]);

  return (
    <DashboardLayout
      logo={<BrandLogo />}
      navItems={agreementsNavItems}
      sidebarFooter={<SidebarCTA />}
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
      <div className="mt-2 sticky top-0 z-20 bg-[var(--color-bg-page)]">
        <Tabs tabs={tabs} activeId={activeTab} onChange={(id) => setActiveTab(id as AgreementsFilterTab)} />
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <SearchBar
            placeholder="Search agreements"
            value={search}
            onChange={setSearch}
            className="flex-1"
          />
          <button
            onClick={() => setFiltersOpen(true)}
            className="size-11 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)] active:bg-[var(--color-bg-surface)] active:border-[var(--color-border-strong)] focus-visible:outline-none focus-visible:border-[var(--color-border-focus)] transition-colors cursor-pointer shrink-0"
            aria-label="Open filters"
          >
            <SlidersHorizontal size={20} />
          </button>
        </div>

        {/* Sort dropdown is desktop-only — the mobile toolbar keeps the search
            bar and filter button only. */}
        <div className="hidden md:block">
          <SortDropdown options={sortOptions} value={sort} onChange={setSort} />
        </div>
      </div>

      {/* Table flows in normal layout — vertical scrolling is handled by the
          page-level scroll container in `DashboardLayout`. */}
      <div>
        <AgreementsTable
          rows={displayedRows}
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
        merchants={uniqueMerchants}
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
