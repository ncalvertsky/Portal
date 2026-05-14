import { Send } from "lucide-react";

interface SidebarCTAProps {
  onGetStarted?: () => void;
}

export default function SidebarCTA({ onGetStarted }: SidebarCTAProps = {}) {
  return (
    <div className="rounded-2xl bg-[var(--color-bg-page)] border border-[var(--color-border-brand)] p-4 flex flex-col gap-3">
      <div className="size-12 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center text-[var(--color-text-primary)] shrink-0">
        <Send size={20} />
      </div>
      <div className="flex flex-col gap-2">
        <span className="text-base font-medium leading-[18px] text-[var(--color-text-primary)]">
          Send your own invoices on Outpave.
        </span>
        <span className="text-sm leading-4 text-[var(--color-text-tertiary)]">
          Free to start.
        </span>
      </div>
      <button
        type="button"
        onClick={onGetStarted}
        className="w-full h-10 rounded-xl text-sm font-semibold bg-[var(--color-brand)] text-[var(--color-text-on-brand)] hover:bg-[var(--color-brand-hover)] transition-colors cursor-pointer"
      >
        Get started
      </button>
    </div>
  );
}
