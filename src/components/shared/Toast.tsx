import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

interface ToastProps {
  open: boolean;
  message: string;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  open,
  message,
  onClose,
  duration = 3000,
}: ToastProps) {
  const [mounted, setMounted] = useState(false);
  const [entered, setEntered] = useState(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // Two rAFs ensure the off-screen state paints before we flip to on-screen,
      // so the CSS transition runs on enter.
      const id1 = requestAnimationFrame(() => {
        const id2 = requestAnimationFrame(() => setEntered(true));
        rafRef.current = id2;
      });
      rafRef.current = id1;
      return () => {
        if (rafRef.current) cancelAnimationFrame(rafRef.current);
      };
    }
    setEntered(false);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, duration, onClose]);

  useEffect(() => {
    if (open || !mounted) return;
    const t = setTimeout(() => setMounted(false), 300);
    return () => clearTimeout(t);
  }, [open, mounted]);

  if (!mounted) return null;

  return (
    <div className="fixed top-6 right-6 z-[60] pointer-events-none">
      <div
        style={{
          transform: entered ? "translateX(0)" : "translateX(calc(100% + 24px))",
          opacity: entered ? 1 : 0,
        }}
        className="flex items-center gap-3 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-xl pl-3 pr-4 py-3 shadow-xl pointer-events-auto transition-all duration-300 ease-out"
      >
        <div className="size-8 rounded-lg bg-[var(--color-positive)]/15 flex items-center justify-center text-[var(--color-positive)] shrink-0">
          <Check size={18} />
        </div>
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {message}
        </span>
      </div>
    </div>
  );
}
