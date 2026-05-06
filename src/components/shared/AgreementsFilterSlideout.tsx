import { useEffect, useState } from "react";
import { X, Calendar, ArrowRight } from "lucide-react";
import Selector from "./Selector";
import type { AgreementRow } from "../../data/mockData";

export type AgreementsFilterTab = "all" | "to-sign" | "signed";

export type LinkedToPayment = "yes" | "no";

export interface AgreementsFilterState {
  totalMin: string;
  totalMax: string;
  merchants: string[];
  linkedToPayment: LinkedToPayment[];
  issueDateFrom: string;
  issueDateTo: string;
  dueDateFrom: string;
  dueDateTo: string;
  signingDateFrom: string;
  signingDateTo: string;
}

export const emptyAgreementsFilters: AgreementsFilterState = {
  totalMin: "",
  totalMax: "",
  merchants: [],
  linkedToPayment: [],
  issueDateFrom: "",
  issueDateTo: "",
  dueDateFrom: "",
  dueDateTo: "",
  signingDateFrom: "",
  signingDateTo: "",
};

const linkedOptions: { id: LinkedToPayment; label: string }[] = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];

function toggle<T>(arr: T[], value: T): T[] {
  return arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
}

interface Props {
  open: boolean;
  merchants: string[];
  value: AgreementsFilterState;
  onClose: () => void;
  onApply: (filters: AgreementsFilterState) => void;
}

export default function AgreementsFilterSlideout({
  open,
  merchants,
  value,
  onClose,
  onApply,
}: Props) {
  const [draft, setDraft] = useState<AgreementsFilterState>(value);

  useEffect(() => {
    if (open) setDraft(value);
  }, [open, value]);

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
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 ${
          open ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed right-0 top-0 bottom-0 z-50 w-[384px] max-w-full flex flex-col bg-[var(--color-bg-page)] border-l border-[var(--color-border)] rounded-l-3xl shadow-xl transition-transform duration-200 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        aria-hidden={!open}
      >
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

        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-7">
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

          <Section title="Merchant">
            <CheckboxList
              options={merchants.map((m) => ({ id: m, label: m }))}
              selected={draft.merchants}
              onToggle={(id) =>
                setDraft((d) => ({ ...d, merchants: toggle(d.merchants, id) }))
              }
            />
          </Section>

          <Section title="Linked to payment">
            <CheckboxList
              options={linkedOptions}
              selected={draft.linkedToPayment}
              onToggle={(id) =>
                setDraft((d) => ({
                  ...d,
                  linkedToPayment: toggle(d.linkedToPayment, id),
                }))
              }
            />
          </Section>

          <Section title="Issue date">
            <DateRange
              from={draft.issueDateFrom}
              to={draft.issueDateTo}
              onFromChange={(v) => setDraft((d) => ({ ...d, issueDateFrom: v }))}
              onToChange={(v) => setDraft((d) => ({ ...d, issueDateTo: v }))}
            />
          </Section>

          <Section title="Due date">
            <DateRange
              from={draft.dueDateFrom}
              to={draft.dueDateTo}
              onFromChange={(v) => setDraft((d) => ({ ...d, dueDateFrom: v }))}
              onToChange={(v) => setDraft((d) => ({ ...d, dueDateTo: v }))}
            />
          </Section>

          <Section title="Signing date">
            <DateRange
              from={draft.signingDateFrom}
              to={draft.signingDateTo}
              onFromChange={(v) =>
                setDraft((d) => ({ ...d, signingDateFrom: v }))
              }
              onToChange={(v) => setDraft((d) => ({ ...d, signingDateTo: v }))}
            />
          </Section>
        </div>

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
            onClick={() => setDraft(emptyAgreementsFilters)}
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

function parseAmount(s: string): number {
  return parseFloat(s.replace(/[$,]/g, "")) || 0;
}

function parseMMDDYY(s: string): number | null {
  const m = s.match(/^(\d{2})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const [, mm, dd, yy] = m;
  return new Date(2000 + parseInt(yy, 10), parseInt(mm, 10) - 1, parseInt(dd, 10)).getTime();
}

function inDateRange(
  rowDate: string | null,
  fromStr: string,
  toStr: string
): boolean {
  const fromMs = parseMMDDYY(fromStr);
  const toMs = parseMMDDYY(toStr);
  if (fromMs == null && toMs == null) return true;
  if (!rowDate) return false;
  const rowMs = parseMMDDYY(rowDate);
  if (rowMs == null) return false;
  if (fromMs != null && rowMs < fromMs) return false;
  if (toMs != null && rowMs > toMs) return false;
  return true;
}

export function applyAgreementFilters(
  rows: AgreementRow[],
  f: AgreementsFilterState
): AgreementRow[] {
  const minNum = f.totalMin ? parseAmount(f.totalMin) : null;
  const maxNum = f.totalMax ? parseAmount(f.totalMax) : null;

  return rows.filter((r) => {
    if (minNum != null || maxNum != null) {
      const amt = r.amount ? parseAmount(r.amount) : null;
      if (amt == null) return false;
      if (minNum != null && amt < minNum) return false;
      if (maxNum != null && amt > maxNum) return false;
    }

    if (f.merchants.length > 0 && !f.merchants.includes(r.customer)) return false;

    if (f.linkedToPayment.length > 0) {
      const isLinked = r.orderType != null;
      const okYes = f.linkedToPayment.includes("yes") && isLinked;
      const okNo = f.linkedToPayment.includes("no") && !isLinked;
      if (!okYes && !okNo) return false;
    }

    if (!inDateRange(r.issueDate, f.issueDateFrom, f.issueDateTo)) return false;
    if (!inDateRange(r.dueDate, f.dueDateFrom, f.dueDateTo)) return false;
    if (!inDateRange(r.signingDate, f.signingDateFrom, f.signingDateTo)) return false;

    return true;
  });
}
