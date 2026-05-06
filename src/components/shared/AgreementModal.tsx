import { useEffect, useMemo, useRef, useState } from "react";
import { X, Check } from "lucide-react";
import Selector from "./Selector";

interface AgreementModalProps {
  open: boolean;
  customer: string;
  onClose: () => void;
  onComplete: () => void;
  /** Whether completing the modal chains into a payment step. */
  continueToPayment?: boolean;
}

type ItemId = 1 | 2 | 3;

export default function AgreementModal({
  open,
  customer,
  onClose,
  onComplete,
  continueToPayment = true,
}: AgreementModalProps) {
  const [item1, setItem1] = useState(false);
  const [item2, setItem2] = useState(false);
  const [signature, setSignature] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Record<ItemId, HTMLDivElement | null>>({
    1: null,
    2: null,
    3: null,
  });

  useEffect(() => {
    if (!open) return;
    setItem1(false);
    setItem2(false);
    setSignature("");
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  const status: Record<ItemId, boolean> = useMemo(
    () => ({
      1: item1,
      2: item2,
      3: Boolean(signature.trim()),
    }),
    [item1, item2, signature]
  );

  const completedCount = [status[1], status[2], status[3]].filter(Boolean).length;
  const allComplete = completedCount === 3;

  const jumpTo = (id: ItemId) => {
    const el = itemRefs.current[id];
    const scrollEl = scrollRef.current;
    if (!el || !scrollEl) return;
    scrollEl.scrollTo({
      top: el.offsetTop - 40,
      behavior: "smooth",
    });
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-[800px] h-full max-h-[840px] bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-xl md:rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between px-4 pt-5 pb-4 md:px-10 md:pt-10 md:pb-6 shrink-0">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight text-[var(--color-text-primary)] leading-none">
                Agreement
              </h2>
              <span className="text-2xl font-medium tracking-tight text-[var(--color-text-secondary)] leading-none">
                1/2
              </span>
            </div>
            <p className="text-sm text-[var(--color-text-secondary)] leading-snug max-w-[520px]">
              Review the agreement and complete the highlighted required items.
              Use the markers on the right to navigate the document.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close agreement"
            className="p-1 text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Document */}
        <div className="flex-1 min-h-0 px-3 pb-3 md:px-10 md:pb-6">
          <div
            ref={scrollRef}
            className="relative h-full rounded-xl md:rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] overflow-y-auto"
          >
            {/* Inline jump markers */}
            <div className="absolute right-3 top-0 z-10 flex flex-col gap-3 pt-6 pointer-events-none">
              <JumpBadge
                n={1}
                completed={status[1]}
                onClick={() => jumpTo(1)}
              />
              <JumpBadge
                n={2}
                completed={status[2]}
                onClick={() => jumpTo(2)}
              />
              <JumpBadge
                n={3}
                completed={status[3]}
                onClick={() => jumpTo(3)}
              />
            </div>

            <div className="px-4 py-5 md:px-10 md:py-8 flex flex-col gap-5 text-sm leading-relaxed text-[var(--color-text-primary)]">
              <h3 className="text-lg font-semibold">
                Customer Sales, Delivery, and Payment Authorization Agreement
              </h3>
              <p className="text-[var(--color-text-secondary)]">
                This Customer Sales, Delivery, and Payment Authorization
                Agreement ("Agreement") is entered into by and between Sky
                Heavy Building Materials, located at 319 E. Maxwell St,
                Lexington, KY 40508 ("Seller"), and {customer || "Customer"},
                with delivery located at 112 Mustang Cove, Wilmore, KY 40390
                ("Customer").
              </p>
              <p className="text-[var(--color-text-secondary)]">
                This Agreement governs the sale, delivery, and payment for the
                materials and services described in Invoice No. 20260109013946,
                dated January 9, 2026 ("Invoice").
              </p>

              <div>
                <h4 className="font-semibold mb-2">
                  1. Products and Services Purchased
                </h4>
                <p className="text-[var(--color-text-secondary)]">
                  Customer agrees to purchase the following goods and services
                  from Seller:
                </p>
                <ul className="mt-2 ml-6 list-disc text-[var(--color-text-secondary)]">
                  <li>Installation Fee — $100.00</li>
                  <li>Delivery Fee — $25.00</li>
                  <li>Porous Asphalt — 5 tons @ $75.00 ($375.00)</li>
                  <li>Recycled Asphalt — 3 tons @ $20.00 ($60.00)</li>
                  <li>Pea Gravel — 1 cubic yard @ $46.00 ($46.00)</li>
                </ul>
                <div className="mt-3 text-[var(--color-text-secondary)]">
                  <div>Subtotal: $606.00</div>
                  <div>Sales Tax: $36.36</div>
                  <div>Card Processing Fee (if applicable): $19.85</div>
                  <div className="mt-2 font-semibold text-[var(--color-text-primary)]">
                    Total Amount Due: $662.21
                  </div>
                </div>
              </div>

              {/* Required item 1 */}
              <RequiredRow
                n={1}
                ref={(el) => {
                  itemRefs.current[1] = el;
                }}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <Selector checked={item1} onChange={setItem1} />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    I acknowledge the line items, taxes, and card processing fees
                    listed above.
                  </span>
                </label>
              </RequiredRow>

              <div>
                <h4 className="font-semibold mb-2">
                  2. Authorization to Charge and Payment Method
                </h4>
                <p className="text-[var(--color-text-secondary)]">
                  Customer expressly authorizes Seller to charge the Total
                  Amount Due to the payment method selected by Customer,
                  including any applicable card processing fee disclosed at
                  checkout or on the Invoice.
                </p>
                <p className="mt-3 text-[var(--color-text-secondary)]">
                  Customer acknowledges that:
                </p>
                <ul className="mt-1 ml-6 list-disc text-[var(--color-text-secondary)]">
                  <li>Payment authorization constitutes final approval of the transaction.</li>
                  <li>Card processing fees are non-refundable.</li>
                  <li>Payment obligations are not contingent on resale, project completion, or third-party approval.</li>
                </ul>
              </div>

              {/* Required item 2 */}
              <RequiredRow
                n={2}
                ref={(el) => {
                  itemRefs.current[2] = el;
                }}
              >
                <label className="flex items-start gap-3 cursor-pointer">
                  <Selector checked={item2} onChange={setItem2} />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    I authorize Seller to charge the Total Amount Due to my
                    selected payment method and understand the fees are
                    non-refundable.
                  </span>
                </label>
              </RequiredRow>

              <div>
                <h4 className="font-semibold mb-2">3. Signature</h4>
                <p className="text-[var(--color-text-secondary)]">
                  By signing below, Customer confirms they have read, understood,
                  and agreed to all terms of this Agreement.
                </p>
              </div>

              {/* Required item 3 — Signature */}
              <RequiredRow
                n={3}
                ref={(el) => {
                  itemRefs.current[3] = el;
                }}
              >
                <div className="flex flex-col gap-2">
                  <label
                    htmlFor="agreement-signature"
                    className="text-xs font-medium text-[var(--color-text-secondary)]"
                  >
                    Signature
                  </label>
                  <input
                    id="agreement-signature"
                    type="text"
                    value={signature}
                    onChange={(e) => setSignature(e.target.value)}
                    placeholder="Type your full name"
                    className="h-11 px-3 rounded-xl bg-[var(--color-bg-page)] border border-[var(--color-border)] outline-none focus:border-[var(--color-brand)] transition-colors text-base font-medium text-[var(--color-text-primary)] placeholder:text-[var(--color-text-secondary)]"
                    style={{ fontFamily: '"Geist", "Inter", serif' }}
                  />
                </div>
              </RequiredRow>

              <p className="text-[var(--color-text-secondary)] pb-6">
                By completing this agreement, Customer waives any right to
                dispute the authorized charge other than as required by
                applicable law.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-4 md:px-10 md:py-5 border-t border-[var(--color-border)] shrink-0">
          <span className="text-sm font-medium text-[var(--color-text-secondary)]">
            {completedCount} / 3 completed
          </span>
          <button
            onClick={allComplete ? onComplete : undefined}
            disabled={!allComplete}
            className={`h-11 px-6 rounded-xl text-sm font-medium tracking-tight transition-opacity ${
              allComplete
                ? "bg-[var(--color-brand)] text-[var(--color-text-on-brand)] hover:opacity-90 cursor-pointer"
                : "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)] cursor-not-allowed"
            }`}
          >
            {continueToPayment ? "Sign & Continue" : "Sign & Complete"}
          </button>
        </div>
      </div>
    </div>
  );
}

function JumpBadge({
  n,
  completed,
  onClick,
}: {
  n: number;
  completed: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`pointer-events-auto w-8 h-6 rounded-md flex items-center justify-center text-xs font-semibold transition-colors cursor-pointer ${
        completed
          ? "bg-[var(--color-positive)]/20 text-[var(--color-positive)]"
          : "bg-[var(--color-brand-8)] text-[var(--color-brand)] hover:bg-[var(--color-brand-20)]"
      }`}
      aria-label={`Jump to required item ${n}${completed ? " (completed)" : ""}`}
    >
      {completed ? <Check size={12} /> : n}
    </button>
  );
}

const RequiredRow = (function () {
  // forwardRef alternative using a callback ref inside a wrapper
  return function RequiredRowImpl({
    n,
    ref,
    children,
  }: {
    n: number;
    ref: (el: HTMLDivElement | null) => void;
    children: React.ReactNode;
  }) {
    return (
      <div
        ref={ref}
        className="relative rounded-xl bg-[var(--color-brand-8)] border border-[var(--color-brand-20)] px-4 py-4 scroll-mt-6"
      >
        <span className="absolute -top-2 -left-2 size-5 rounded-md bg-[var(--color-brand)] text-[var(--color-text-on-brand)] text-[11px] font-semibold flex items-center justify-center">
          {n}
        </span>
        {children}
      </div>
    );
  };
})();
