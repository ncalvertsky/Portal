import {
  forwardRef,
  type ButtonHTMLAttributes,
  type ReactNode,
} from "react";
import type { LucideIcon } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "danger";
export type ButtonSize = "md" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  children?: ReactNode;
}

const base =
  "inline-flex items-center justify-center gap-2 rounded-xl font-medium tracking-tight whitespace-nowrap transition-colors cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none";

const sizeClasses: Record<ButtonSize, string> = {
  md: "h-11 min-w-[88px] px-4 text-sm",
  sm: "h-8 min-w-[88px] px-4 text-[13px]",
};

// Spec: primary fills with brand; hover lightens; press darkens; disabled goes
// to elevated bg with muted text. Focus-visible shows a warm ring so the
// user can see keyboard focus distinct from press.
const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "bg-[var(--color-brand)] text-[var(--color-text-on-brand)] border border-transparent",
    "hover:bg-[color-mix(in_srgb,var(--color-brand)_85%,white)]",
    "active:bg-[color-mix(in_srgb,var(--color-brand)_85%,black)]",
    "disabled:bg-[var(--color-bg-elevated)] disabled:text-[var(--color-text-secondary)] disabled:hover:bg-[var(--color-bg-elevated)]",
    "focus-visible:ring-2 focus-visible:ring-[var(--color-neutral-warn)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-page)]",
  ].join(" "),

  secondary: [
    "bg-[var(--color-bg-page)] text-[var(--color-text-primary)] border border-[var(--color-border)]",
    "hover:bg-[var(--color-bg-elevated)]",
    "active:bg-[var(--color-bg-surface)]",
    "disabled:text-[var(--color-text-secondary)] disabled:hover:bg-[var(--color-bg-page)]",
    "focus-visible:border-[var(--color-brand)]",
  ].join(" "),

  danger: [
    "bg-[var(--color-bg-page)] text-[var(--color-text-primary)] border border-[var(--color-negative)]",
    "hover:bg-[var(--color-bg-elevated)]",
    "active:bg-[var(--color-bg-surface)]",
    "disabled:border-[var(--color-border)] disabled:text-[var(--color-text-secondary)] disabled:hover:bg-[var(--color-bg-page)]",
    "focus-visible:border-2",
  ].join(" "),
};

const iconSizeFor = (size: ButtonSize) => (size === "sm" ? 14 : 20);

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = "primary",
    size = "md",
    icon: Icon,
    iconPosition = "left",
    className = "",
    children,
    type = "button",
    ...rest
  },
  ref
) {
  const iconEl = Icon ? <Icon size={iconSizeFor(size)} aria-hidden /> : null;
  return (
    <button
      ref={ref}
      type={type}
      className={`${base} ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
      {...rest}
    >
      {iconEl && iconPosition === "left" && iconEl}
      {children}
      {iconEl && iconPosition === "right" && iconEl}
    </button>
  );
});

export default Button;
