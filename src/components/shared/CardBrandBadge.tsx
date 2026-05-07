import { Landmark } from "lucide-react";

export type CardBrand = "visa" | "mastercard" | "amex" | "discover" | "bank";

interface CardBrandBadgeProps {
  brand: CardBrand;
  size?: "sm" | "md";
}

export default function CardBrandBadge({ brand, size = "md" }: CardBrandBadgeProps) {
  if (brand === "bank") {
    return (
      <div className="size-9 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-icon-default)]">
        <Landmark size={16} />
      </div>
    );
  }

  const dims = size === "sm" ? "w-[30px] h-5" : "w-[33px] h-[22px]";

  if (brand === "visa") {
    // White card, classic Visa navy wordmark.
    return (
      <div
        className={`${dims} rounded bg-white flex items-center justify-center text-[7px] font-bold text-[#1a1f71] italic tracking-[0.5px]`}
      >
        VISA
      </div>
    );
  }

  if (brand === "mastercard") {
    // Dark card with the overlapping red + yellow circles.
    return (
      <div
        className={`${dims} rounded bg-[#333436] flex items-center justify-center`}
      >
        <span className="size-[10px] rounded-full bg-[#eb001b]" />
        <span className="size-[10px] rounded-full bg-[#f79e1b] -ml-[6px] mix-blend-screen" />
      </div>
    );
  }

  if (brand === "amex") {
    // Brand-blue card with "AMEX" in white.
    return (
      <div
        className={`${dims} rounded bg-[#006fcf] flex items-center justify-center text-[7px] font-bold text-white tracking-[0.5px] leading-none`}
      >
        AMEX
      </div>
    );
  }

  // discover — white card with the dark wordmark.
  return (
    <div
      className={`${dims} rounded bg-white flex items-center justify-center text-[6px] font-bold text-[#161617] tracking-[0.5px]`}
    >
      DISCOVER
    </div>
  );
}
