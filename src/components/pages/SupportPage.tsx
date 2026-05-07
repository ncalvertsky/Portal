import { useState } from "react";
import { ChevronDown, Mail, Phone, MapPin, ArrowUpRight } from "lucide-react";
import DashboardLayout from "../layout/DashboardLayout";
import BrandLogo from "../shared/BrandLogo";
import SidebarCTA from "../shared/SidebarCTA";
import {
  supportNavItems,
  merchants,
  outpaveSupport,
  type PageId,
  type Merchant,
} from "../../data/mockData";

interface SupportPageProps {
  onNavigate?: (pageId: PageId) => void;
  onLogout?: () => void;
}

interface FaqEntry {
  question: string;
  answer: string;
}

const FAQS: FaqEntry[] = [
  {
    question: "How do I pay an invoice?",
    answer:
      'Click the "Pay" button on the invoice or use the link in the email you received. You can pay with a credit card, debit card, or US bank account.',
  },
  {
    question: "My payment failed. What do I do?",
    answer:
      "Most failures are due to incorrect card details, an expired card, or insufficient funds. Check your payment info and try again, or use a different payment method. If the issue continues, contact your card issuer.",
  },
  {
    question: "How do I get a refund?",
    answer:
      "Refund policies are set by each merchant, not by Outpave. To request a refund, contact your merchant directly using the contact info on the invoice. Approved refunds typically appear back on your original payment method within 5–10 business days.",
  },
  {
    question: "Where can I find a receipt?",
    answer:
      "Go to the Payments page and click any paid invoice to see the full record and download a PDF receipt. Receipts are also emailed to you automatically when a payment is processed.",
  },
  {
    question: "I forgot my password.",
    answer:
      'On the sign-in page, click "Forgot password?" and enter your email. We\'ll send you a link to set a new password — it expires after 30 minutes for security.',
  },
  {
    question: "How do I add someone from my company to the portal?",
    answer:
      'Go to the Team page and click "Invite member." Enter their email and choose a role: Admins can manage payment methods and invite others, Members can view and pay invoices.',
  },
];

export default function SupportPage({ onNavigate, onLogout }: SupportPageProps = {}) {
  return (
    <DashboardLayout
      logo={<BrandLogo />}
      navItems={supportNavItems}
      sidebarFooter={<SidebarCTA />}
      showLogout={false}
      onNavigate={onNavigate}
      onLogout={onLogout}
      topBarLeft={
        <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)] flex-1 min-w-0">
          Support
        </h1>
      }
    >
      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center gap-5">
        <Card title="FAQ">
          <FaqList />
        </Card>

        <Card
          title="Questions about your invoice?"
          subtitle="Contact your merchant directly"
        >
          <MerchantList />
        </Card>

        <Card title="Still need help?">
          <div className="flex flex-col gap-2 pt-4">
            <ContactRow
              icon={<Phone size={16} />}
              href={`tel:${outpaveSupport.phone.replace(/\s|\(|\)|-/g, "")}`}
              label={outpaveSupport.phone}
            />
            <ContactRow
              icon={<Mail size={16} />}
              href={`mailto:${outpaveSupport.email}`}
              label={outpaveSupport.email}
            />
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}

function Card({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full max-w-[680px] rounded-3xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] px-6 pt-6 pb-5 flex flex-col">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[13px] text-[var(--color-text-secondary)]">
            {subtitle}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function FaqList() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  return (
    <div className="flex flex-col pt-4">
      {FAQS.map((faq, i) => {
        const open = i === openIndex;
        const isLast = i === FAQS.length - 1;
        return (
          <div
            key={faq.question}
            className={`flex flex-col py-4 ${
              isLast ? "" : "border-b border-[var(--color-border)]"
            }`}
          >
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : i)}
              aria-expanded={open}
              className="w-full flex items-center justify-between gap-3 text-left cursor-pointer"
            >
              <span className="text-base font-medium tracking-tight text-[var(--color-text-primary)]">
                {faq.question}
              </span>
              <ChevronDown
                size={16}
                className={`text-[var(--color-icon-secondary)] shrink-0 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </button>
            {/* Grid trick: animates between 0fr and 1fr so the answer
                expands/collapses to its real height without a JS height
                measure. The inner overflow-hidden hides the text mid-anim. */}
            <div
              className={`grid transition-[grid-template-rows] duration-200 ease-out ${
                open ? "grid-rows-[1fr] pt-2" : "grid-rows-[0fr]"
              }`}
            >
              <p className="overflow-hidden text-sm text-[var(--color-text-secondary)] leading-snug">
                {faq.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MerchantList() {
  return (
    <div className="flex flex-col">
      {merchants.map((merchant, i) => {
        const isLast = i === merchants.length - 1;
        return (
          <div
            key={merchant.id}
            className={`flex flex-col gap-3 py-4 ${
              isLast ? "" : "border-b border-[var(--color-border)]"
            }`}
          >
            <h3 className="text-base font-medium tracking-tight text-[var(--color-text-primary)]">
              {merchant.name}
            </h3>
            <MerchantContact merchant={merchant} />
          </div>
        );
      })}
    </div>
  );
}

function MerchantContact({ merchant }: { merchant: Merchant }) {
  return (
    <div className="flex flex-col gap-2">
      <ContactRow
        icon={<Phone size={16} />}
        href={`tel:${merchant.phone.replace(/\s|\(|\)|-/g, "")}`}
        label={merchant.phone}
      />
      <ContactRow
        icon={<Mail size={16} />}
        href={`mailto:${merchant.email}`}
        label={merchant.email}
      />
      <div className="flex items-start gap-2">
        <MapPin
          size={16}
          className="text-[var(--color-icon-secondary)] shrink-0 mt-0.5"
        />
        <div className="flex flex-col gap-1 min-w-0 flex-1">
          <span className="text-sm text-[var(--color-text-secondary)] leading-snug">
            {merchant.address}
          </span>
          {merchant.mapUrl && (
            <a
              href={merchant.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm text-[var(--color-brand)] hover:underline self-start"
            >
              See on map
              <ArrowUpRight size={16} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

function ContactRow({
  icon,
  href,
  label,
}: {
  icon: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-2 text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] transition-colors"
    >
      <span className="text-[var(--color-icon-secondary)] shrink-0">{icon}</span>
      <span>{label}</span>
    </a>
  );
}
