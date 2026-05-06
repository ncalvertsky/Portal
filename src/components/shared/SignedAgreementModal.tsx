import { useEffect } from "react";
import { X, Download, Check } from "lucide-react";

interface SignedAgreementModalProps {
  open: boolean;
  /** The merchant who issued the agreement (Ozinga, Knight's Redi Mix, etc.).
   * Acts as the Seller party in the contract. */
  merchant: string;
  agreementType: string;
  signingDate: string | null;
  amount: string | null;
  onClose: () => void;
}

/**
 * A read-only "PDF preview" of a signed agreement. This is a prototype — every
 * signed row renders the same sample contract, with the merchant name,
 * agreement type, signing date, and amount substituted in. The signee is
 * always the logged-in customer (Katy Shultz), since this view is rendered
 * from her perspective: merchants send agreements to her for signing.
 *
 * The styling deliberately breaks from the rest of the dark UI to mimic a
 * printed PDF page (white paper, dark text, serif body copy, rubber-stamped
 * "SIGNED" watermark).
 */
const SIGNEE_NAME = "Katy Shultz";
const SIGNEE_ADDRESS = "112 Mustang Cove, Wilmore, KY 40390";

export default function SignedAgreementModal({
  open,
  merchant,
  agreementType,
  signingDate,
  amount,
  onClose,
}: SignedAgreementModalProps) {
  useEffect(() => {
    if (!open) return;
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

  if (!open) return null;

  const displaySigningDate = signingDate ?? "—";
  const displayAmount = amount ?? "$0.00";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-[880px] h-full max-h-[900px] bg-[var(--color-bg-page)] border border-[var(--color-border)] rounded-2xl overflow-hidden flex flex-col shadow-2xl">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)] shrink-0">
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-[var(--color-text-primary)]">
              {agreementType}
            </span>
            <span className="text-xs text-[var(--color-text-secondary)]">
              Sent by {merchant} · Signed by {SIGNEE_NAME} on{" "}
              {displaySigningDate}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                /* Prototype only — no actual download. */
              }}
              className="h-9 px-3 rounded-lg flex items-center gap-2 text-sm font-medium border border-[var(--color-border)] text-[var(--color-text-primary)] bg-transparent hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
            >
              <Download size={14} />
              Download PDF
            </button>
            <button
              onClick={onClose}
              aria-label="Close document"
              className="p-1 text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* PDF page */}
        <div className="flex-1 min-h-0 overflow-y-auto bg-[#3a3a3a] p-8">
          <div
            className="relative mx-auto max-w-[720px] bg-white text-neutral-900 shadow-2xl rounded-sm"
            style={{ fontFamily: '"Geist", "Inter", serif' }}
          >
            {/* SIGNED watermark */}
            <div
              aria-hidden
              className="pointer-events-none absolute top-32 right-12 select-none"
              style={{ transform: "rotate(-14deg)" }}
            >
              <div
                className="border-[3px] border-emerald-700/70 text-emerald-700/70 px-6 py-2 rounded-sm text-3xl font-extrabold tracking-[0.2em]"
                style={{ fontFamily: '"Geist", "Inter", sans-serif' }}
              >
                SIGNED
              </div>
            </div>

            <div className="px-14 py-14 flex flex-col gap-5 text-[13px] leading-relaxed">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-neutral-200 pb-5 mb-2">
                <div className="flex flex-col">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    {merchant}
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Issued by Seller
                  </span>
                </div>
                <div className="flex flex-col text-right">
                  <span className="text-[11px] uppercase tracking-[0.18em] text-neutral-500">
                    Document
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    {agreementType}
                  </span>
                </div>
              </div>

              <h3 className="text-xl font-semibold text-neutral-900">
                Customer Sales, Delivery, and Payment Authorization Agreement
              </h3>

              <p className="text-neutral-700">
                This {agreementType} ("Agreement") is entered into by and
                between{" "}
                <span className="font-semibold text-neutral-900">
                  {merchant}
                </span>{" "}
                ("Seller") and{" "}
                <span className="font-semibold text-neutral-900">
                  {SIGNEE_NAME}
                </span>
                , with delivery located at {SIGNEE_ADDRESS} ("Customer").
              </p>

              <p className="text-neutral-700">
                This Agreement governs the sale, delivery, and payment for the
                materials and services described in the associated invoice,
                executed on {displaySigningDate}.
              </p>

              <div>
                <h4 className="font-semibold mb-2 text-neutral-900">
                  1. Products and Services Purchased
                </h4>
                <p className="text-neutral-700">
                  Customer agrees to purchase the following goods and services
                  from Seller:
                </p>
                <ul className="mt-2 ml-6 list-disc text-neutral-700">
                  <li>Installation Fee — $100.00</li>
                  <li>Delivery Fee — $25.00</li>
                  <li>Porous Asphalt — 5 tons @ $75.00 ($375.00)</li>
                  <li>Recycled Asphalt — 3 tons @ $20.00 ($60.00)</li>
                  <li>Pea Gravel — 1 cubic yard @ $46.00 ($46.00)</li>
                </ul>
                <div className="mt-3 text-neutral-700">
                  <div>Subtotal: $606.00</div>
                  <div>Sales Tax: $36.36</div>
                  <div>Card Processing Fee (if applicable): $19.85</div>
                  <div className="mt-2 font-semibold text-neutral-900">
                    Total Amount Due: {displayAmount}
                  </div>
                </div>
              </div>

              {/* Acknowledgement 1 — completed */}
              <CompletedRow>
                I acknowledge the line items, taxes, and card processing fees
                listed above.
              </CompletedRow>

              <div>
                <h4 className="font-semibold mb-2 text-neutral-900">
                  2. Authorization to Charge and Payment Method
                </h4>
                <p className="text-neutral-700">
                  Customer expressly authorizes Seller to charge the Total
                  Amount Due to the payment method selected by Customer,
                  including any applicable card processing fee disclosed at
                  checkout or on the Invoice.
                </p>
                <p className="mt-3 text-neutral-700">
                  Customer acknowledges that:
                </p>
                <ul className="mt-1 ml-6 list-disc text-neutral-700">
                  <li>
                    Payment authorization constitutes final approval of the
                    transaction.
                  </li>
                  <li>Card processing fees are non-refundable.</li>
                  <li>
                    Payment obligations are not contingent on resale, project
                    completion, or third-party approval.
                  </li>
                </ul>
              </div>

              {/* Acknowledgement 2 — completed */}
              <CompletedRow>
                I authorize Seller to charge the Total Amount Due to my selected
                payment method and understand the fees are non-refundable.
              </CompletedRow>

              <div>
                <h4 className="font-semibold mb-2 text-neutral-900">
                  3. Signature
                </h4>
                <p className="text-neutral-700">
                  By signing below, Customer confirms they have read, understood,
                  and agreed to all terms of this Agreement.
                </p>
              </div>

              {/* Signature block */}
              <div className="mt-2 pt-6 border-t border-neutral-300 flex items-end justify-between">
                <div className="flex flex-col gap-1 flex-1 max-w-[320px]">
                  <span
                    className="text-2xl text-neutral-900"
                    style={{ fontFamily: '"Snell Roundhand", "Apple Chancery", "Brush Script MT", cursive' }}
                  >
                    {SIGNEE_NAME}
                  </span>
                  <div className="border-t border-neutral-400 pt-1">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                      Customer signature
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-sm font-medium text-neutral-900">
                    {displaySigningDate}
                  </span>
                  <div className="border-t border-neutral-400 pt-1">
                    <span className="text-[10px] uppercase tracking-[0.18em] text-neutral-500">
                      Date signed
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-neutral-500 text-[11px] pt-6 border-t border-neutral-200 mt-4">
                By completing this agreement, Customer waives any right to
                dispute the authorized charge other than as required by
                applicable law. Document ID: SKY-
                {/* Deterministic placeholder hashed off the merchant + signing
                    date so the same row renders the same ID across views. */}
                {Math.abs(
                  `${merchant}|${displaySigningDate}`
                    .split("")
                    .reduce((h, c) => (h * 31 + c.charCodeAt(0)) | 0, 0)
                )
                  .toString(16)
                  .toUpperCase()
                  .padStart(8, "0")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function CompletedRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-md bg-emerald-50 border border-emerald-200 px-4 py-3 flex items-start gap-3">
      <span className="size-5 rounded-md bg-emerald-600 text-white flex items-center justify-center shrink-0 mt-0.5">
        <Check size={12} />
      </span>
      <span className="text-[13px] text-neutral-800">{children}</span>
    </div>
  );
}
