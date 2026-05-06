import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
}

export default function Tooltip({ content, children, className = "" }: TooltipProps) {
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current || !tipRef.current) return;
    const trig = triggerRef.current.getBoundingClientRect();
    const tip = tipRef.current.getBoundingClientRect();
    const top = trig.top - tip.height - 8; // 8px gap for arrow
    const left = trig.left + trig.width / 2 - tip.width / 2;
    setPos({ top, left });
  }, [open, content]);

  return (
    <span
      ref={triggerRef}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      className={`relative inline-flex items-center ${className}`}
    >
      {children}
      {open &&
        createPortal(
          <div
            ref={tipRef}
            role="tooltip"
            style={{
              position: "fixed",
              top: pos?.top ?? -9999,
              left: pos?.left ?? -9999,
              visibility: pos ? "visible" : "hidden",
            }}
            className="pointer-events-none z-[100]"
          >
            <div className="relative block px-3 py-2 w-max max-w-[240px] rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] text-[12px] font-normal text-[var(--color-text-primary)] text-center leading-[1.24] tracking-tight shadow-[0_2px_6px_0_rgba(16,24,40,0.06)]">
              {content}
              <span
                aria-hidden
                style={{ transform: "translateX(-50%) rotate(45deg)" }}
                className="absolute left-1/2 -bottom-[5px] size-[8px] bg-[var(--color-bg-elevated)] border-r border-b border-[var(--color-border)]"
              />
            </div>
          </div>,
          document.body
        )}
    </span>
  );
}
