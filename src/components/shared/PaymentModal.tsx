import { useEffect, useState } from "react";
import {
  X,
  ChevronDown,
  ChevronLeft,
  Trash2,
  Lock,
  CreditCard,
  ShieldCheck,
  HelpCircle,
} from "lucide-react";
import BrandLogo from "./BrandLogo";
import { usePaymentMethods, type PaymentMethod } from "../../PaymentMethodsContext";

interface PaymentModalProps {
  open: boolean;
  onClose: () => void;
  onPay?: () => void;
  customer: string;
  amount: string;
}

type CardBrand = "visa" | "mastercard" | "amex" | "discover";

type View = "select" | "new-card";

export default function PaymentModal({
  open,
  onClose,
  onPay,
  customer,
  amount,
}: PaymentModalProps) {
  const { methods, remove, add } = usePaymentMethods();
  const cards = methods.filter((m): m is PaymentMethod & { brand: CardBrand } =>
    m.brand !== "bank"
  );
  const defaultId = cards.find((c) => c.isDefault)?.id ?? cards[0]?.id ?? "";
  const [selectedCard, setSelectedCard] = useState<string>(defaultId);
  const [view, setView] = useState<View>("select");
  const [saveCard, setSaveCard] = useState(true);

  useEffect(() => {
    if (!open) return;
    setView("select");
    setSelectedCard(defaultId);
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative bg-white border border-[#e0dfe2] rounded-xl overflow-hidden flex h-[640px] max-h-full shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Close payment"
          className="absolute top-1.5 right-1.5 z-10 p-1.5 rounded-full bg-white/70 backdrop-blur-sm hover:bg-black/5 transition-colors cursor-pointer"
        >
          <X size={14} className="text-[#161616]" />
        </button>

        {/* Left panel */}
        <div className="w-[280px] h-full p-6 flex flex-col justify-between border-r border-[#e0dfe2] shrink-0">
          <div className="flex flex-col gap-[18px]">
            <div className="flex flex-col gap-6">
              <BrandLogo
                className="w-auto h-8"
                style={{ color: "#161616" }}
              />

              <div className="flex items-center justify-between">
                <span className="text-[24px] font-medium tracking-tight text-[#161616] leading-none">
                  Pay
                </span>
                <div className="flex items-center gap-2">
                  <QrIcon />
                  <ChevronDown size={12} className="text-[#161616]" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4 pt-4 border-t border-[#e0dfe2]">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-medium text-[#727272] leading-[18px]">
                  Payment amount
                </span>
                <span className="text-[42px] font-semibold tracking-tight text-[#161616] leading-[1.1]">
                  {amount}
                </span>
              </div>
              <div className="flex gap-1.5">
                <CardBrandBadge brand="visa" />
                <CardBrandBadge brand="mastercard" />
                <CardBrandBadge brand="amex" />
                <CardBrandBadge brand="discover" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShieldCheck size={18} className="text-[#727272] shrink-0" />
            <p className="text-xs font-medium text-[#727272] leading-[14px]">
              Secure payments
              <br />
              powered by Fractal
            </p>
          </div>
        </div>

        {/* Right panel */}
        <div
          className={`w-[362px] h-full px-6 flex flex-col justify-between shrink-0 ${
            view === "new-card" ? "pt-6 pb-8" : "py-8"
          }`}
        >
          {view === "select" ? (
            <SelectCardView
              customer={customer}
              cards={cards}
              selectedCard={selectedCard}
              onSelectCard={setSelectedCard}
              onRemoveCard={remove}
              onAddNewCard={() => setView("new-card")}
              onPay={onPay}
              amount={amount}
            />
          ) : (
            <NewCardView
              amount={amount}
              saveCard={saveCard}
              onToggleSaveCard={() => setSaveCard((s) => !s)}
              onBack={() => setView("select")}
              onPay={(card) => {
                if (saveCard) {
                  add({
                    brand: card.brand,
                    last4: card.last4,
                    detail: card.expiry,
                  });
                }
                onPay?.();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}

function SelectCardView({
  customer,
  cards,
  selectedCard,
  onSelectCard,
  onRemoveCard,
  onAddNewCard,
  onPay,
  amount,
}: {
  customer: string;
  cards: (PaymentMethod & { brand: CardBrand })[];
  selectedCard: string;
  onSelectCard: (id: string) => void;
  onRemoveCard: (id: string) => void;
  onAddNewCard: () => void;
  onPay?: () => void;
  amount: string;
}) {
  return (
    <>
      <div className="flex flex-col gap-6">
        <h2 className="text-[24px] font-semibold tracking-tight text-[#161616] leading-[32px]">
          Pay {customer}
        </h2>

        <div className="flex flex-col gap-3">
          <span className="text-xs font-medium text-[#727272] leading-[18px]">
            Cards/ACH
          </span>
          <div className="flex flex-col">
            {cards.map((card, i) => (
              <CardRow
                key={card.id}
                card={card}
                selected={selectedCard === card.id}
                onSelect={() => onSelectCard(card.id)}
                onRemove={() => onRemoveCard(card.id)}
                isFirst={i === 0}
                isLast={i === cards.length - 1}
              />
            ))}
          </div>

          <button
            onClick={onAddNewCard}
            className="mt-2 border border-[#e0dfe2] rounded-full px-8 py-3 flex items-center justify-center gap-2.5 text-sm font-medium text-[#161616] hover:bg-[#f7f7f8] transition-colors cursor-pointer"
          >
            Pay with other card
            <CreditCard size={16} />
          </button>
        </div>
      </div>

      <button
        onClick={onPay}
        className="h-12 rounded-full bg-[#161616] text-white flex items-center justify-center gap-1.5 text-base font-medium tracking-tight hover:opacity-90 transition-opacity cursor-pointer"
      >
        <Lock size={12} />
        Pay {amount}
      </button>
    </>
  );
}

function formatCardNumber(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(input: string): string {
  const digits = input.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

function formatCvc(input: string): string {
  return input.replace(/\D/g, "").slice(0, 4);
}

function formatZip(input: string): string {
  return input.replace(/\D/g, "").slice(0, 5);
}

function detectBrand(cardNumber: string): CardBrand {
  const first = cardNumber.replace(/\D/g, "").charAt(0);
  if (first === "4") return "visa";
  if (first === "5") return "mastercard";
  if (first === "3") return "amex";
  if (first === "6") return "discover";
  return "visa";
}

function NewCardView({
  amount,
  saveCard,
  onToggleSaveCard,
  onBack,
  onPay,
}: {
  amount: string;
  saveCard: boolean;
  onToggleSaveCard: () => void;
  onBack: () => void;
  onPay: (card: { brand: CardBrand; last4: string; expiry: string }) => void;
}) {
  const [name, setName] = useState("Katy Shultz");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [zip, setZip] = useState("12001");

  const cardDigits = cardNumber.replace(/\D/g, "");
  const expiryDigits = expiry.replace(/\D/g, "");
  const canPay =
    name.trim().length > 0 &&
    cardDigits.length >= 13 &&
    expiryDigits.length === 4 &&
    cvc.length >= 3 &&
    zip.length === 5;

  const handlePay = () => {
    if (!canPay) return;
    const last4 = cardDigits.slice(-4);
    const mm = expiryDigits.slice(0, 2);
    const yy = expiryDigits.slice(2);
    onPay({
      brand: detectBrand(cardDigits),
      last4,
      expiry: `${mm}/${yy}`,
    });
  };

  return (
    <>
      <div className="flex flex-col gap-6">
        <button
          onClick={onBack}
          className="self-start flex items-center gap-1.5 bg-white border border-[#e0dfe2] rounded-full pl-3 pr-4 py-[9px] shadow-sm text-sm font-medium text-[#161616] hover:bg-[#f7f7f8] transition-colors cursor-pointer"
        >
          <ChevronLeft size={12} />
          Back
        </button>

        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3">
            <Field label="Name on card">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[42px] px-[11px] bg-white border border-[#e0dfe2] rounded-lg text-sm font-medium text-[#161616] outline-none focus:border-[#161616] transition-colors"
              />
            </Field>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-[#727272] leading-[18px]">
                Card details
              </label>
              <div className="flex flex-col">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="cc-number"
                  placeholder="0000 0000 0000 0000"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  className="w-full h-[42px] px-[11px] bg-white border border-[#e0dfe2] rounded-t-lg text-sm font-medium text-[#161616] placeholder:opacity-50 outline-none focus:border-[#161616] transition-colors -mb-px"
                />
                <div className="flex -mb-px">
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="cc-exp"
                    placeholder="MM / YY"
                    value={expiry}
                    onChange={(e) => setExpiry(formatExpiry(e.target.value))}
                    className="flex-1 min-w-0 h-[42px] px-[11px] bg-white border border-[#e0dfe2] rounded-bl-lg text-sm font-medium text-[#161616] placeholder:opacity-50 outline-none focus:border-[#161616] transition-colors -mr-px"
                  />
                  <div className="flex-1 min-w-0 h-[42px] bg-white border border-[#e0dfe2] rounded-br-lg flex items-center px-[11px] gap-2.5 focus-within:border-[#161616] transition-colors">
                    <input
                      type="text"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="CVC"
                      value={cvc}
                      onChange={(e) => setCvc(formatCvc(e.target.value))}
                      className="flex-1 min-w-0 bg-transparent text-sm font-medium text-[#161616] placeholder:opacity-50 outline-none"
                    />
                    <HelpCircle size={16} className="text-[#727272] shrink-0" />
                  </div>
                </div>
              </div>
            </div>

            <Field label="ZIP code">
              <div className="w-full h-[42px] bg-white border border-[#e0dfe2] rounded-lg flex items-center px-[11px] gap-2.5 focus-within:border-[#161616] transition-colors">
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  value={zip}
                  onChange={(e) => setZip(formatZip(e.target.value))}
                  className="flex-1 min-w-0 bg-transparent text-sm font-medium text-[#161616] outline-none"
                />
                <HelpCircle size={16} className="text-[#727272] shrink-0" />
              </div>
            </Field>

            <Field label="Order ID / Description">
              <div className="w-full h-[42px] bg-[#f6f6f7] border border-[#e0dfe2] rounded-lg flex items-center px-[11px] text-sm font-medium text-[#727272]">
                Invoice #2213
              </div>
            </Field>
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <Toggle checked={saveCard} onChange={onToggleSaveCard} />
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-medium text-[#161616]">
                Save card for future payments
              </span>
              <HelpCircle size={14} className="text-[#727272]" />
            </div>
          </label>
        </div>
      </div>

      <button
        onClick={handlePay}
        disabled={!canPay}
        className={`h-12 rounded-full flex items-center justify-center gap-1.5 text-base font-medium tracking-tight text-white transition-opacity ${
          canPay
            ? "bg-[#161616] hover:opacity-90 cursor-pointer"
            : "bg-[#727272] cursor-not-allowed"
        }`}
      >
        <Lock size={12} />
        Pay {amount}
      </button>
    </>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-xs font-medium text-[#727272] leading-[18px]">
        {label}
      </label>
      {children}
    </div>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={onChange}
      className={`w-9 h-[20px] rounded-full flex items-center p-0.5 transition-colors cursor-pointer ${
        checked ? "bg-[#61c699] justify-end" : "bg-[#e0dfe2] justify-start"
      }`}
    >
      <span className="size-4 rounded-full bg-white shadow-sm" />
    </button>
  );
}

function CardRow({
  card,
  selected,
  onSelect,
  onRemove,
  isFirst,
  isLast,
}: {
  card: PaymentMethod & { brand: CardBrand };
  selected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  isFirst: boolean;
  isLast: boolean;
}) {
  const rounded = isFirst ? "rounded-t-lg" : isLast ? "rounded-b-lg" : "";
  return (
    <div
      className={`${rounded} ${
        !isFirst ? "-mt-px" : ""
      } border border-[#e0dfe2] flex gap-3 items-center px-3 py-3 w-full bg-white`}
    >
      <button
        onClick={onSelect}
        aria-label={`Select card ending in ${card.last4}`}
        className="shrink-0 cursor-pointer"
      >
        <Radio checked={selected} />
      </button>
      <button
        onClick={onSelect}
        className="flex-1 flex items-center justify-between min-w-0 cursor-pointer"
      >
        <div className="flex gap-3 items-center">
          <span className="text-sm font-medium text-[#161616] w-[68px] text-left">
            **** {card.last4}
          </span>
          <span className="text-sm font-medium text-black/50">{card.detail}</span>
        </div>
        <CardBrandBadge brand={card.brand} small />
      </button>
      <button
        onClick={onRemove}
        aria-label={`Remove card ending in ${card.last4}`}
        className="shrink-0 text-[#727272] hover:text-[#161616] transition-colors cursor-pointer"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

function Radio({ checked }: { checked: boolean }) {
  return (
    <div
      className={`size-4 rounded-full border flex items-center justify-center ${
        checked ? "border-[#161616]" : "border-[#e0dfe2]"
      }`}
    >
      {checked && <div className="size-[8px] rounded-full bg-[#161616]" />}
    </div>
  );
}

function CardBrandBadge({
  brand,
  small = false,
}: {
  brand: CardBrand;
  small?: boolean;
}) {
  const w = small ? "w-[30px] h-[20px]" : "w-[33px] h-[22px]";
  const fs = small ? "text-[7px]" : "text-[8px]";
  if (brand === "visa") {
    return (
      <div
        className={`${w} rounded-[5.5px] bg-white border border-[#e0dfe2] flex items-center justify-center ${fs} font-bold text-[#1a1f71] tracking-wider`}
      >
        VISA
      </div>
    );
  }
  if (brand === "mastercard") {
    return (
      <div
        className={`${w} rounded-[5.5px] bg-[#333436] flex items-center justify-center gap-[2px]`}
      >
        <span className="size-[10px] rounded-full bg-[#eb001b] opacity-90" />
        <span className="size-[10px] rounded-full bg-[#f79e1b] opacity-90 -ml-[6px]" />
      </div>
    );
  }
  if (brand === "amex") {
    return (
      <div
        className={`${w} rounded-[5.5px] bg-[#006fcf] flex items-center justify-center ${fs} font-bold text-white tracking-wider leading-[7px] text-center`}
      >
        AMEX
      </div>
    );
  }
  return (
    <div
      className={`${w} rounded-[5.5px] bg-white border border-[#e0dfe2] flex items-center justify-center text-[6px] font-bold text-[#ff6000] tracking-wider`}
    >
      DISCOVER
    </div>
  );
}

function QrIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden>
      <rect x="1" y="1" width="8" height="8" rx="1" stroke="#161616" strokeWidth="1.5" />
      <rect x="13" y="1" width="8" height="8" rx="1" stroke="#161616" strokeWidth="1.5" />
      <rect x="1" y="13" width="8" height="8" rx="1" stroke="#161616" strokeWidth="1.5" />
      <rect x="4" y="4" width="2" height="2" fill="#161616" />
      <rect x="16" y="4" width="2" height="2" fill="#161616" />
      <rect x="4" y="16" width="2" height="2" fill="#161616" />
      <rect x="13" y="13" width="3" height="3" fill="#161616" />
      <rect x="18" y="13" width="3" height="3" fill="#161616" />
      <rect x="13" y="18" width="3" height="3" fill="#161616" />
      <rect x="18" y="18" width="3" height="3" fill="#161616" />
    </svg>
  );
}
