import type { ReactNode } from "react";

export type TagTone = "blue" | "red" | "yellow" | "green" | "neutral";
export type TagSize = "sm" | "md";

interface TagProps {
  tone?: TagTone;
  size?: TagSize;
  className?: string;
  children: ReactNode;
}

const TONE_CLASSES: Record<TagTone, string> = {
  blue: "bg-[var(--color-brand-8)] text-[var(--color-brand)]",
  red: "bg-[color-mix(in_srgb,var(--color-negative)_8%,transparent)] text-[var(--color-negative)]",
  yellow:
    "bg-[color-mix(in_srgb,var(--color-neutral-warn)_8%,transparent)] text-[var(--color-neutral-warn)]",
  green:
    "bg-[color-mix(in_srgb,var(--color-positive)_8%,transparent)] text-[var(--color-positive)]",
  neutral:
    "bg-[var(--color-bg-elevated)] text-[var(--color-text-secondary)]",
};

const SIZE_CLASSES: Record<TagSize, string> = {
  sm: "h-5 px-1.5 py-1 text-xs rounded-lg",
  md: "h-6 px-2 py-1 text-sm rounded-lg",
};

export default function Tag({
  tone = "blue",
  size = "md",
  className = "",
  children,
}: TagProps) {
  return (
    <span
      className={`inline-flex items-center justify-center font-medium tracking-tight whitespace-nowrap ${TONE_CLASSES[tone]} ${SIZE_CLASSES[size]} ${className}`}
    >
      {children}
    </span>
  );
}
