import { useEffect, useState, type ReactNode } from "react";
import { ChevronDown, X } from "lucide-react";
import Button from "./Button";
import Selector from "./Selector";
import CardBrandBadge, { type CardBrand } from "./CardBrandBadge";
import { usePaymentMethods } from "../../PaymentMethodsContext";

interface AddPaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
}

type Tab = "card" | "bank";

interface CardFields {
  name: string;
  number: string;
  expiration: string;
  cvc: string;
  zip: string;
}

interface BankFields {
  holder: string;
  routing: string;
  account: string;
  accountType: "Checking" | "Savings";
}

const EMPTY_CARD: CardFields = {
  name: "",
  number: "",
  expiration: "",
  cvc: "",
  zip: "",
};

const EMPTY_BANK: BankFields = {
  holder: "",
  routing: "",
  account: "",
  accountType: "Checking",
};

// First-digit brand detection — good enough for a prototype.
function detectBrand(number: string): CardBrand | null {
  const digits = number.replace(/\D/g, "");
  if (!digits) return null;
  if (digits.startsWith("4")) return "visa";
  if (/^(5[1-5]|2[2-7])/.test(digits)) return "mastercard";
  if (/^3[47]/.test(digits)) return "amex";
  if (digits.startsWith("6")) return "discover";
  return null;
}

function formatCardNumber(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 19);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiration(value: string): string {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length < 3) return digits;
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
}

export default function AddPaymentMethodModal({
  open,
  onClose,
}: AddPaymentMethodModalProps) {
  const { add } = usePaymentMethods();
  const [tab, setTab] = useState<Tab>("card");
  const [card, setCard] = useState<CardFields>(EMPTY_CARD);
  const [bank, setBank] = useState<BankFields>(EMPTY_BANK);
  const [makeDefault, setMakeDefault] = useState(false);

  useEffect(() => {
    if (open) {
      setTab("card");
      setCard(EMPTY_CARD);
      setBank(EMPTY_BANK);
      setMakeDefault(false);
    }
  }, [open]);

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

  const updateCard = (key: keyof CardFields) => (value: string) =>
    setCard((prev) => ({ ...prev, [key]: value }));

  const updateBank =
    <K extends keyof BankFields>(key: K) =>
    (value: BankFields[K]) =>
      setBank((prev) => ({ ...prev, [key]: value }));

  const detectedBrand = detectBrand(card.number);

  const cardValid =
    card.name.trim().length > 0 &&
    card.number.replace(/\D/g, "").length >= 13 &&
    /^\d{2}\/\d{2}$/.test(card.expiration) &&
    /^\d{3,4}$/.test(card.cvc) &&
    /^\d{5}(-\d{4})?$/.test(card.zip.trim());

  const bankValid =
    bank.holder.trim().length > 0 &&
    /^\d{9}$/.test(bank.routing) &&
    /^\d{4,17}$/.test(bank.account);

  const canSubmit = tab === "card" ? cardValid : bankValid;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (tab === "card") {
      const digits = card.number.replace(/\D/g, "");
      add({
        brand: detectedBrand ?? "visa",
        last4: digits.slice(-4),
        detail: card.expiration,
        isDefault: makeDefault,
      });
    } else {
      add({
        brand: "bank",
        last4: bank.account.slice(-4),
        detail: bank.accountType,
        isDefault: makeDefault,
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-payment-title"
        className="relative w-full max-w-[480px] max-h-[calc(100vh-2rem)] overflow-y-auto bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl shadow-[0_16px_32px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)] flex flex-col gap-6 p-6"
      >
        <div className="flex items-start justify-between">
          <h2
            id="add-payment-title"
            className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none"
          >
            Add payment method
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="size-5 -mt-0.5 -mr-1 text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col gap-4">
          {/* Card / Bank toggle — matches Figma's pill segmented control. */}
          <div className="shrink-0 h-[57px] p-2 rounded-full bg-[var(--color-bg-page)] border border-[var(--color-border)] flex items-center gap-0">
            <SegmentButton active={tab === "card"} onClick={() => setTab("card")}>
              Card
            </SegmentButton>
            <SegmentButton active={tab === "bank"} onClick={() => setTab("bank")}>
              US bank account
            </SegmentButton>
          </div>

          {tab === "card" ? (
            <>
              <Field label="Name on card">
                <Input
                  value={card.name}
                  onChange={updateCard("name")}
                  placeholder="Katy Shultz"
                  autoComplete="cc-name"
                />
              </Field>
              <Field label="Card number">
                <Input
                  value={card.number}
                  onChange={(value) => updateCard("number")(formatCardNumber(value))}
                  placeholder="1234 1234 1234 1234"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  trailing={
                    <div className="flex gap-1 items-center shrink-0">
                      {detectedBrand ? (
                        <CardBrandBadge brand={detectedBrand} size="sm" />
                      ) : (
                        <>
                          <CardBrandBadge brand="visa" size="sm" />
                          <CardBrandBadge brand="mastercard" size="sm" />
                          <CardBrandBadge brand="amex" size="sm" />
                          <CardBrandBadge brand="discover" size="sm" />
                        </>
                      )}
                    </div>
                  }
                />
              </Field>
              <div className="flex gap-3">
                <Field label="Expiration" className="flex-1">
                  <Input
                    value={card.expiration}
                    onChange={(value) =>
                      updateCard("expiration")(formatExpiration(value))
                    }
                    placeholder="MM / YY"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                  />
                </Field>
                <Field label="Security code" className="flex-1">
                  <Input
                    value={card.cvc}
                    onChange={(value) =>
                      updateCard("cvc")(value.replace(/\D/g, "").slice(0, 4))
                    }
                    placeholder="CVC"
                    inputMode="numeric"
                    autoComplete="cc-csc"
                  />
                </Field>
              </div>
              <Field label="ZIP">
                <Input
                  value={card.zip}
                  onChange={updateCard("zip")}
                  placeholder="37201"
                  inputMode="numeric"
                  autoComplete="postal-code"
                />
              </Field>
            </>
          ) : (
            <>
              <Field label="Name on account">
                <Input
                  value={bank.holder}
                  onChange={updateBank("holder")}
                  placeholder="Katy Shultz"
                  autoComplete="name"
                />
              </Field>
              <Field label="Routing number">
                <Input
                  value={bank.routing}
                  onChange={(value) =>
                    updateBank("routing")(value.replace(/\D/g, "").slice(0, 9))
                  }
                  placeholder="00000000"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Account number">
                <Input
                  value={bank.account}
                  onChange={(value) =>
                    updateBank("account")(value.replace(/\D/g, "").slice(0, 17))
                  }
                  placeholder="00000000"
                  inputMode="numeric"
                />
              </Field>
              <Field label="Account type">
                <div className="h-11 pl-5 pr-6 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center gap-2 focus-within:border-[var(--color-border-focus)] transition-colors relative">
                  <select
                    value={bank.accountType}
                    onChange={(e) =>
                      updateBank("accountType")(e.target.value as BankFields["accountType"])
                    }
                    className="flex-1 min-w-0 bg-transparent text-sm text-[var(--color-text-primary)] outline-none appearance-none cursor-pointer pr-2"
                  >
                    <option value="Checking">Checking</option>
                    <option value="Savings">Savings</option>
                  </select>
                  <ChevronDown
                    size={12}
                    className="text-[var(--color-icon-secondary)] pointer-events-none shrink-0"
                  />
                </div>
              </Field>
            </>
          )}

          <label className="flex items-center gap-2.5 pt-1 cursor-pointer">
            <Selector
              checked={makeDefault}
              onChange={setMakeDefault}
              ariaLabel="Make default payment method"
            />
            <span className="text-sm text-[var(--color-text-secondary)]">
              Make default payment method
            </span>
          </label>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            variant="primary"
            disabled={!canSubmit}
            onClick={handleSubmit}
            className="w-full"
          >
            Save payment method
          </Button>
          <p className="text-xs text-[var(--color-text-tertiary)] leading-snug">
            By saving this payment method, you authorize Outpave to charge it for
            future invoices from merchants you owe. You can remove it any time in
            Settings.
          </p>
        </div>
      </div>
    </div>
  );
}

function SegmentButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 h-[41px] rounded-full border text-[13px] font-medium tracking-tight transition-colors cursor-pointer ${
        active
          ? "bg-[var(--color-bg-elevated)] border-[var(--color-border)] text-[var(--color-text-primary)] hover:border-[var(--color-border-strong)]"
          : "bg-transparent border-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-surface)] hover:text-[var(--color-text-primary)]"
      }`}
    >
      {children}
    </button>
  );
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={`flex flex-col gap-2 ${className}`}>
      <span className="text-[13px] font-medium text-[var(--color-text-primary)] leading-none">
        {label}
      </span>
      {children}
    </label>
  );
}

function Input({
  value,
  onChange,
  placeholder,
  trailing,
  inputMode,
  autoComplete,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  trailing?: ReactNode;
  inputMode?: "numeric" | "text";
  autoComplete?: string;
}) {
  return (
    <div className="h-11 pl-5 pr-4 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center gap-2 focus-within:border-[var(--color-border-focus)] transition-colors">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        inputMode={inputMode}
        autoComplete={autoComplete}
        className="flex-1 min-w-0 bg-transparent text-sm text-[var(--color-text-primary)] placeholder:text-[var(--color-text-tertiary)] outline-none"
      />
      {trailing}
    </div>
  );
}
