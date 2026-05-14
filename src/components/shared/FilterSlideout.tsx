import { useEffect, useState } from "react";
import { X, Calendar, ArrowRight } from "lucide-react";
import Selector from "./Selector";
import type { PaymentStatus } from "../../data/mockData";

export type FilterTab = "all" | "requests" | "invoices";

export type PaymentTypeFilter = "one" | "partial";
export type InvoiceTypeFilter = "invoice" | "estimate";
export type StatusFilter = "overdue" | "due-soon" | "pending" | "paid";

export interface FilterState {
  totalMin: string;
  totalMax: string;
  paymentTypes: PaymentTypeFilter[];
  invoiceTypes: InvoiceTypeFilter[];
  merchants: string[];
  statuses: StatusFilter[];
  dateFrom: string;
  dateTo: string;
}

export const emptyFilters: FilterState = {
  totalMin: "",
  totalMax: "",
  paymentTypes: [],
  invoiceTypes: [],
  merchants: [],
  statuses: [],
  dateFrom: "",
  dateTo: "",
};

interface FilterSlideoutProps {
  open: boolean;
  tab: FilterTab;
  value: FilterState;
  onClose: () => void;
  onApply: (filters: FilterState) => void;
}

const paymentTypeOptions: { id: PaymentTypeFilter; label: string }[] = [
  { id: "one", label: "One payment" },
  { id: "partial", label: "Partial Payments" },
];

const invoiceTypeOptions: { id: InvoiceTypeFilter; label: string }[] = [
  { id: "invoice", label: "Invoice" },
  { id: "estimate", label: "Estimate" },
];

const statusOptions: { id: StatusFilter; label: string }[] = [
  { id: "overdue", label: "Overdue" },
  { id: "due-soon", label: "Due soon" },
  { id: "pending", label: "Pending" },
  { id: "paid", label: "Paid" },
];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

export default function FilterSlideout({
  open,
  tab,
  value,
  onClose,
  onApply,
}: FilterSlideoutProps) {
  const [draft, setDraft] = useState<FilterState>(value);

  // Reset draft when opening so users always start from the committed state.
  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

  // Lock background scroll while open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 w-[384px] max-w-full flex flex-col bg-[var(--color-bg-page)] border-l border-[var(--color-border)] rounded-l-3xl shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
        {/* Header */}
        <div className="flex items-baseline justify-between px-5 pt-6 pb-4 border-b border-[var(--color-border)] shrink-0">
          <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary)]">
            Filters
          </h2>
          <button
            onClick={onClose}
            className="p-1 text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
            aria-label="Close filters"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-7">
          {/* Total */}
          <Section title="Total">
            <div className="flex gap-2">
              <MoneyInput
                placeholder="From"
                value={draft.totalMin}
                onChange={(v) => setDraft((d) => ({ ...d, totalMin: v }))}
              />
              <MoneyInput
                placeholder="To"
                value={draft.totalMax}
                onChange={(v) => setDraft((d) => ({ ...d, totalMax: v }))}
              />
            </div>
          </Section>

          {/* Payment type */}
          <Section title="Payment type">
            <CheckboxList
              options={paymentTypeOptions}
              selected={draft.paymentTypes}
              onToggle={(id) =>
                setDraft((d) => ({ ...d, paymentTypes: toggle(d.paymentTypes, id) }))
              }
            />
          </Section>

          {/* Invoice type — invoices tab only */}
          {tab === "invoices" && (
            <Section title="Invoice type">
              <CheckboxList
                options={invoiceTypeOptions}
                selected={draft.invoiceTypes}
                onToggle={(id) =>
                  setDraft((d) => ({
                    ...d,
                    invoiceTypes: toggle(d.invoiceTypes, id),
                  }))
                }
              />
            </Section>
          )}

          {/* Status — merchant section removed since all rows are from
           *  Silvi Materials. */}
          <Section title="Status">
            <CheckboxList
              options={statusOptions}
              selected={draft.statuses}
              onToggle={(id) =>
                setDraft((d) => ({ ...d, statuses: toggle(d.statuses, id) }))
              }
            />
          </Section>

          {/* Date */}
          <Section title="Date">
            <DateRange
              from={draft.dateFrom}
              to={draft.dateTo}
              onFromChange={(v) => setDraft((d) => ({ ...d, dateFrom: v }))}
              onToChange={(v) => setDraft((d) => ({ ...d, dateTo: v }))}
            />
          </Section>
        </div>

        {/* Footer */}
        <div className="px-5 pt-6 pb-5 shrink-0 flex flex-col gap-2">
          <button
            onClick={() => {
              onApply(draft);
              onClose();
            }}
            className="w-full h-10 rounded-xl bg-[var(--color-brand-8)] text-[var(--color-brand)] text-[13px] font-normal tracking-tight hover:bg-[var(--color-brand-20)] transition-colors cursor-pointer"
          >
            Save changes
          </button>
          <button
            onClick={() => setDraft(emptyFilters)}
            className="w-full h-10 rounded-xl border border-[var(--color-border)] text-[var(--color-text-primary)] text-[13px] font-normal tracking-tight hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
          >
            Reset
          </button>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm font-medium tracking-tight text-[var(--color-text-secondary)]">
        {title}
      </div>
      {children}
    </div>
  );
}

function MoneyInput({
  placeholder,
  value,
  onChange,
}: {
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex-1 min-w-0 flex items-center gap-2 h-11 px-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
      <span className="text-base text-[var(--color-text-primary)] w-4 text-center shrink-0">$</span>
      <input
        type="text"
        inputMode="decimal"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 min-w-0 bg-transparent outline-none text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
      />
    </div>
  );
}

function CheckboxList<Id extends string>({
  options,
  selected,
  onToggle,
}: {
  options: { id: Id; label: string }[];
  selected: Id[];
  onToggle: (id: Id) => void;
}) {
  return (
    <div className="flex flex-col gap-3">
      {options.map((opt) => (
        <label
          key={opt.id}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Selector
            checked={selected.includes(opt.id)}
            onChange={() => onToggle(opt.id)}
          />
          <span className="text-sm font-medium tracking-tight text-[var(--color-text-primary)]">
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function DateRange({
  from,
  to,
  onFromChange,
  onToChange,
}: {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-3 h-11 px-4 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
      <Calendar size={16} className="text-[var(--color-icon-secondary)] shrink-0" />
      <input
        type="text"
        placeholder="MM-DD-YY"
        value={from}
        onChange={(e) => onFromChange(e.target.value)}
        className="w-[84px] bg-transparent outline-none text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
      />
      <ArrowRight size={14} className="text-[var(--color-icon-secondary)] shrink-0" />
      <input
        type="text"
        placeholder="MM-DD-YY"
        value={to}
        onChange={(e) => onToChange(e.target.value)}
        className="w-[84px] bg-transparent outline-none text-base text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
      />
    </div>
  );
}

// ============================================================================
// Filtering logic — exported so PaymentsPage can reuse.
// ============================================================================

interface Row {
  type: string;
  customer: string;
  amount: string;
  issueDate: string;
  status: PaymentStatus;
  action: "sign-pay" | "pay" | "view";
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/[$,]/g, "")) || 0;
}

function parseMMDDYY(s: string): number | null {
  const m = s.match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, mm, dd, yy] = m;
  return new Date(2000 + parseInt(yy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10)).getTime();
}

export function applyFilters<T extends Row>(rows: T[], f: FilterState): T[] {
  const minNum = f.totalMin ? parseAmount(f.totalMin) : null;
  const maxNum = f.totalMax ? parseAmount(f.totalMax) : null;
  const fromMs = parseMMDDYY(f.dateFrom);
  const toMs = parseMMDDYY(f.dateTo);

  return rows.filter((r) => {
    // Amount
    const amt = parseAmount(r.amount);
    if (minNum != null && amt < minNum) return false;
    if (maxNum != null && amt > maxNum) return false;

    // Payment type (one vs partial)
    if (f.paymentTypes.length > 0) {
      const isPartial = r.type.includes("(partial)");
      const okOne = f.paymentTypes.includes("one") && !isPartial;
      const okPartial = f.paymentTypes.includes("partial") && isPartial;
      if (!okOne && !okPartial) return false;
    }

    // Invoice type (invoices tab): Invoice vs Estimate
    if (f.invoiceTypes.length > 0) {
      const isInvoice = r.type === "Invoice" || r.type === "Invoice (partial)";
      const isEstimate = r.type === "Estimate";
      const okInvoice = f.invoiceTypes.includes("invoice") && isInvoice;
      const okEstimate = f.invoiceTypes.includes("estimate") && isEstimate;
      if (!okInvoice && !okEstimate) return false;
    }

    // Merchant
    if (f.merchants.length > 0 && !f.merchants.includes(r.customer)) return false;

    // Status — direct mapping to PaymentStatus values on the row.
    if (f.statuses.length > 0) {
      if (!f.statuses.includes(r.status as StatusFilter)) return false;
    }

    // Date range (inclusive)
    const rowMs = parseMMDDYY(r.issueDate);
    if (rowMs != null) {
      if (fromMs != null && rowMs < fromMs) return false;
      if (toMs != null && rowMs > toMs) return false;
    }

    return true;
  });
}
