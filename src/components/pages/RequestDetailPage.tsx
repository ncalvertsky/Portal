import { useMemo, useState } from "react";
import { ArrowLeft, FileText } from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";
import BrandLogo from "../shared/BrandLogo";
import SidebarCTA from "../shared/SidebarCTA";
import Tag, { type TagTone } from "../shared/Tag";
import Button from "../shared/Button";
import AgreementModal from "../shared/AgreementModal";
import PaymentModal from "../shared/PaymentModal";
import Toast from "../shared/Toast";
import {
  paymentsNavItems,
  paymentRows,
  agreementRows,
  type PageId,
  type PaymentRow,
  type PaymentType,
  type AgreementRow,
} from "../../data/mockData";

interface RequestDetailPageProps {
  reference: string;
  onBack: () => void;
  onNavigate?: (pageId: PageId) => void;
  onLogout?: () => void;
}

interface ProductLine {
  name: string;
  qty: number;
  price: number;
  /** Pre-computed line total; the last line absorbs any rounding drift so the
   * column sums exactly to the displayed subtotal. */
  total: number;
}

interface ProductSpec {
  name: string;
  /** [min, max] unit price */
  priceRange: [number, number];
  /** rough max qty — used to keep totals reasonable per line */
  maxQty: number;
}

const PRODUCT_POOL: ProductSpec[] = [
  { name: "Concrete M300 (B22.5)", priceRange: [45, 60], maxQty: 80 },
  { name: "Concrete M250 (B20)", priceRange: [38, 50], maxQty: 80 },
  { name: "Concrete M400 (B30)", priceRange: [55, 75], maxQty: 60 },
  { name: "Sand-Gravel Mix (SGM)", priceRange: [18, 28], maxQty: 40 },
  { name: "Crushed Stone 20mm", priceRange: [22, 32], maxQty: 40 },
  { name: "Pea Gravel (cu yd)", priceRange: [42, 58], maxQty: 30 },
  { name: "Limestone Rip-Rap (ton)", priceRange: [55, 85], maxQty: 25 },
  { name: "Aerated Concrete Block 600x200x300", priceRange: [55, 70], maxQty: 30 },
  { name: 'Hollow Concrete Block 8"', priceRange: [12, 18], maxQty: 200 },
  { name: 'Rebar #4 (½") — 20 ft', priceRange: [14, 22], maxQty: 150 },
  { name: 'Rebar #5 (⅝") — 20 ft', priceRange: [22, 32], maxQty: 100 },
  { name: "Portland Cement Type I (94 lb bag)", priceRange: [12, 18], maxQty: 200 },
  { name: "Mortar Mix (80 lb bag)", priceRange: [8, 14], maxQty: 200 },
  { name: "Wire Mesh 6x6 W2.9xW2.9", priceRange: [80, 120], maxQty: 25 },
  { name: "Curing Compound (5 gal)", priceRange: [60, 95], maxQty: 20 },
  { name: "Form Release Oil (5 gal)", priceRange: [40, 70], maxQty: 20 },
  { name: "Concrete Admixture (5 gal)", priceRange: [50, 90], maxQty: 20 },
  { name: "Bituminous Coating (5 gal)", priceRange: [70, 120], maxQty: 15 },
  { name: "Asphalt Cold Patch (50 lb)", priceRange: [22, 36], maxQty: 80 },
  { name: "Topsoil (cu yd)", priceRange: [30, 50], maxQty: 40 },
];

function hashCode(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function parseAmount(s: string): number {
  return parseFloat(s.replace(/[$,]/g, "")) || 0;
}

function formatMoney(n: number): string {
  return n.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

/**
 * Pick 2–4 products and assign qty/price so the line totals sum exactly to
 * `targetSubtotal`. Caller passes an already-seeded PRNG so all of a row's
 * mock data stays deterministic across renders.
 */
function generateProducts(
  rand: () => number,
  targetSubtotal: number
): ProductLine[] {
  const count = 2 + Math.floor(rand() * 3); // 2..4
  const pool = [...PRODUCT_POOL];
  type Pick = { name: string; qty: number; price: number };
  const picks: Pick[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length);
    const spec = pool.splice(idx, 1)[0];
    const basePrice =
      spec.priceRange[0] +
      rand() * (spec.priceRange[1] - spec.priceRange[0]);
    const qty = Math.max(
      1,
      Math.min(spec.maxQty, Math.round(1 + rand() * spec.maxQty))
    );
    picks.push({ name: spec.name, qty, price: basePrice });
  }

  // Scale prices so line totals roughly sum to targetSubtotal
  const preliminary = picks.reduce((s, p) => s + p.qty * p.price, 0);
  if (preliminary > 0) {
    const scale = targetSubtotal / preliminary;
    picks.forEach((p) => {
      p.price = round2(p.price * scale);
    });
  }

  // Compute line totals; last line absorbs rounding drift so the column sums
  // exactly to targetSubtotal.
  const lines: ProductLine[] = picks.map((p) => ({
    name: p.name,
    qty: p.qty,
    price: p.price,
    total: round2(p.qty * p.price),
  }));
  const otherSum = lines
    .slice(0, -1)
    .reduce((s, l) => s + l.total, 0);
  const last = lines[lines.length - 1];
  last.total = round2(targetSubtotal - otherSum);
  last.price = round2(last.total / last.qty);

  return lines;
}

interface AttachmentFile {
  name: string;
  size: string;
}

const ATTACHMENT_POOL = [
  "Payment proof",
  "Supporting documents",
  "Receipt",
  "Bill of lading",
  "Delivery confirmation",
  "Inspection report",
  "Photo evidence",
];

/** Some invoices have 0–2 supporting files. */
function generateAttachments(rand: () => number): AttachmentFile[] {
  const count = Math.floor(rand() * 3); // 0..2
  if (count === 0) return [];
  const pool = [...ATTACHMENT_POOL];
  const picks: AttachmentFile[] = [];
  for (let i = 0; i < count && pool.length > 0; i++) {
    const idx = Math.floor(rand() * pool.length);
    const name = pool.splice(idx, 1)[0];
    const sizeMb = round2(0.5 + rand() * 4.5);
    picks.push({ name, size: `${sizeMb}MB` });
  }
  return picks;
}

function isInvoice(type: PaymentType): boolean {
  return type === "Invoice" || type === "Invoice (partial)";
}

function findAttachedAgreement(reference: string): AgreementRow | undefined {
  // Strip leading "#" if present, then match against agreement.orderType
  const trimmed = reference.replace(/^#/, "");
  return agreementRows.find((a) => a.orderType?.includes(trimmed));
}

const STATUS_TO_LABEL: Record<PaymentRow["status"], string> = {
  pending: "To pay",
  "due-soon": "Due soon",
  overdue: "Overdue",
  paid: "Paid",
};

const STATUS_TO_TONE: Record<PaymentRow["status"], TagTone> = {
  pending: "blue",
  "due-soon": "yellow",
  overdue: "red",
  paid: "green",
};

export default function RequestDetailPage({
  reference,
  onBack,
  onNavigate,
  onLogout,
}: RequestDetailPageProps) {
  const row = paymentRows.find((r) => r.reference === reference);

  // All hooks must run on every render — keep them above any early return.
  const [signing, setSigning] = useState<{ customer: string; amount: string } | null>(null);
  const [paying, setPaying] = useState<{ customer: string; amount: string } | null>(null);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const { products, totals, attachments, attachedAgreement, hasInvoiceExtras } =
    useMemo(() => {
      if (!row) {
        return {
          products: [] as ProductLine[],
          totals: { subtotal: 0, discount: 0, tax: 0, surcharge: 0 },
          attachments: [] as AttachmentFile[],
          attachedAgreement: undefined as AgreementRow | undefined,
          hasInvoiceExtras: false,
        };
      }
      const grand = parseAmount(row.amount);
      const discount = round2(grand * 0.0156);
      const tax = round2(grand * 0.0725);
      const surcharge = round2(grand * 0.0165);
      const subtotal = round2(grand + discount - tax - surcharge);
      const rand = mulberry32(hashCode(row.reference) || 1);
      const products = generateProducts(rand, subtotal);
      const isInv = isInvoice(row.type);
      const attachments = isInv ? generateAttachments(rand) : [];
      const attachedAgreement = isInv
        ? findAttachedAgreement(row.reference)
        : undefined;
      return {
        products,
        totals: { subtotal, discount, tax, surcharge },
        attachments,
        attachedAgreement,
        hasInvoiceExtras: isInv,
      };
    }, [row]);

  if (!row) {
    return (
      <DashboardLayout
        logo={<BrandLogo />}
        navItems={paymentsNavItems}
        sidebarFooter={<SidebarCTA />}
        showLogout={false}
        onNavigate={onNavigate}
        onLogout={onLogout}
      >
        <div className="text-[var(--color-text-secondary)]">Request not found.</div>
      </DashboardLayout>
    );
  }

  const isRequest = row.type.toLowerCase().includes("request");
  const titlePrefix = isRequest ? "Request" : "Invoice";
  const status = row.status;

  const payable = row.action === "pay" || row.action === "sign-pay";
  const payLabel =
    row.action === "sign-pay"
      ? `Sign & Pay ${row.amount}`
      : `Pay ${row.amount}`;

  const handlePayClick = () => {
    const info = { customer: row.customer, amount: row.amount };
    if (row.action === "sign-pay") {
      setSigning(info);
    } else {
      setPaying(info);
    }
  };

  return (
    <DashboardLayout
      logo={<BrandLogo />}
      navItems={paymentsNavItems}
      sidebarFooter={<SidebarCTA />}
      showLogout={false}
      onNavigate={onNavigate}
      onLogout={onLogout}
      topBarLeft={
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <button
            type="button"
            onClick={onBack}
            aria-label="Back"
            className="size-12 rounded-2xl bg-[var(--color-bg-surface)] flex items-center justify-center text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer shrink-0"
          >
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none truncate">
            {titlePrefix} {row.reference}
          </h1>
          <Tag tone={STATUS_TO_TONE[status]} className="shrink-0">
            {STATUS_TO_LABEL[status]}
          </Tag>
        </div>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-5">
        {/* Pay action — hidden once paid */}
        {payable && (
          <div className="flex justify-end">
            <Button variant="primary" onClick={handlePayClick}>
              {payLabel}
            </Button>
          </div>
        )}

        {/* Top three info cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <InfoCard
            title="Data"
            items={[
              { label: "Date", value: row.issueDate },
              { label: "Due date", value: row.dueDate ?? "—" },
              { label: "Pre-authorize", value: "No" },
              { label: "Note", value: "Payment due within 30 days" },
            ]}
          />
          <InfoCard
            title="Supplier"
            items={[
              { label: "Name", value: row.customer },
              { label: "Address", value: "123 W Main St, Nashville, TN 40142" },
              { label: "Phone", value: "+1 (555) 123-4567" },
              { label: "Note", value: "contact@ozinga.com" },
            ]}
          />
          <InfoCard
            title="Client"
            items={[
              { label: "Name", value: "Katy Shultz" },
              { label: "Address", value: "123 Main St, Suite 100, Nashville, TN 37201" },
              { label: "Phone", value: "+1 (555) 123-4567" },
              { label: "Note", value: "kshultz@clarkconstruction.com" },
            ]}
          />
        </div>

        {/* Products card */}
        <div className="w-full rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] px-6 pt-6 pb-5 flex flex-col gap-2">
          <div className="flex items-start justify-between pb-2">
            <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none h-10 flex items-center">
              Products
            </h2>
          </div>

          <div className="flex flex-col">
            {/* Header */}
            <div className="flex items-center border-b border-[var(--color-border)] py-4">
              <span className="flex-1 text-base text-[var(--color-text-secondary)] tracking-tight">
                Product name
              </span>
              <span className="w-[120px] text-right text-base text-[var(--color-text-secondary)] tracking-tight">
                Qty
              </span>
              <span className="w-[120px] text-right text-base text-[var(--color-text-secondary)] tracking-tight">
                Price ($)
              </span>
              <span className="w-[120px] text-right text-base text-[var(--color-text-secondary)] tracking-tight">
                Total ($)
              </span>
            </div>

            <div className="flex flex-col pt-2">
              {products.map((p) => (
                <div key={p.name} className="flex items-center py-2">
                  <span className="flex-1 text-base text-[var(--color-text-primary)] tracking-tight">
                    {p.name}
                  </span>
                  <span className="w-[120px] text-right text-base text-[var(--color-text-primary)] tracking-tight tabular-nums">
                    {p.qty}
                  </span>
                  <span className="w-[120px] text-right text-base text-[var(--color-text-primary)] tracking-tight tabular-nums">
                    {formatMoney(p.price)}
                  </span>
                  <span className="w-[120px] text-right text-base text-[var(--color-text-primary)] tracking-tight tabular-nums">
                    {formatMoney(p.total)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Totals card */}
        <div className="w-full rounded-3xl bg-[var(--color-bg-surface)] px-6 pt-6 pb-5 flex flex-col gap-5">
          <div className="flex flex-col gap-3">
            <TotalsRow label="Subtotal" value={`$${formatMoney(totals.subtotal)}`} />
            <TotalsRow label="Discount" value={`−$${formatMoney(totals.discount)}`} />
            <TotalsRow label="Tax" value={`$${formatMoney(totals.tax)}`} />
            <TotalsRow label="Surcharge" value={`$${formatMoney(totals.surcharge)}`} />
          </div>
          <div className="flex items-center pt-5 border-t border-[var(--color-border)]">
            <span className="flex-1 text-base font-medium text-[var(--color-text-primary)] tracking-tight">
              Grand total
            </span>
            <span className="text-base font-medium text-[var(--color-text-primary)] tracking-tight tabular-nums">
              {row.amount}
            </span>
          </div>
        </div>

        {/* Attachments / Terms & Policy / Agreements — invoices only.
            T&Cs always shows for invoices; Attachments and Agreements are
            conditional. Requests get nothing here. */}
        {hasInvoiceExtras && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {attachments.length > 0 && (
              <FileCard title="Attachments" files={attachments} />
            )}
            <FileCard
              title="Terms & Policy"
              files={[{ name: "Terms & Policy", size: "1.8MB" }]}
            />
            {attachedAgreement && (
              <FileCard
                title="Agreements"
                files={[
                  {
                    name: attachedAgreement.type,
                    size: `${round2(1 + (hashCode(attachedAgreement.id) % 30) / 10)}MB`,
                  },
                ]}
              />
            )}
          </div>
        )}
      </div>

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

function InfoCard({
  title,
  items,
}: {
  title: string;
  items: { label: string; value: string }[];
}) {
  return (
    <div className="w-full rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] px-6 pt-6 pb-5 flex flex-col">
      <div className="flex items-start justify-between pb-2">
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none h-10 flex items-center">
          {title}
        </h2>
      </div>

      <div className="flex flex-col">
        {items.map((item, i) => {
          const isFirst = i === 0;
          const isLast = i === items.length - 1;
          const padding = isFirst ? "pb-3" : isLast ? "pt-3" : "py-3";
          const border = isLast ? "" : "border-b border-[var(--color-border)]";
          return (
            <div
              key={item.label + i}
              className={`flex flex-col gap-1 ${padding} ${border}`}
            >
              <span className="text-base text-[var(--color-text-secondary)] tracking-tight">
                {item.label}
              </span>
              <span className="text-base text-[var(--color-text-primary)] tracking-tight">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function TotalsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center">
      <span className="flex-1 text-base font-medium text-[var(--color-text-primary)] tracking-tight">
        {label}
      </span>
      <span className="text-base font-medium text-[var(--color-text-primary)] tracking-tight tabular-nums">
        {value}
      </span>
    </div>
  );
}

function FileCard({
  title,
  files,
}: {
  title: string;
  files: AttachmentFile[];
}) {
  return (
    <div className="w-full rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] px-6 pt-6 pb-5 flex flex-col">
      <div className="flex items-start justify-between pb-2">
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none h-10 flex items-center">
          {title}
        </h2>
      </div>

      <div className="flex flex-col">
        {files.map((file, i) => {
          const isLast = i === files.length - 1;
          const border = isLast ? "" : "border-b border-[var(--color-border)]";
          return (
            <div
              key={file.name + i}
              className={`flex items-center gap-2 py-3 ${border}`}
            >
              <div className="size-9 rounded-lg bg-[var(--color-brand-8)] text-[var(--color-brand)] flex items-center justify-center shrink-0">
                <FileText size={16} />
              </div>
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-base text-[var(--color-text-primary)] tracking-tight truncate">
                  {file.name}
                </span>
                <div className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] tracking-tight">
                  <span>PDF</span>
                  <span className="size-1 rounded-full bg-[var(--color-text-secondary)]" />
                  <span>{file.size}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
