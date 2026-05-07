import { useEffect, useRef, useState, type ReactNode } from "react";
import { HelpCircle, Bell, ChevronDown, Menu } from "lucide-react";
import ProfileDropdown from "../shared/ProfileDropdown";
import type { PageId } from "../../data/mockData";

interface TopBarProps {
  onMenuToggle: () => void;
  onNavigate?: (pageId: PageId) => void;
  onLogout?: () => void;
  /** Optional custom content for the left side (e.g. a back button on
   *  detail pages). When omitted the left side is empty. */
  leftSlot?: ReactNode;
}

export default function TopBar({ onMenuToggle, onNavigate, onLogout, leftSlot }: TopBarProps) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!profileOpen) return;
    const onDocClick = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setProfileOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [profileOpen]);

  return (
    <div className="flex items-center justify-between h-12 shrink-0 gap-3">
      {/* Hamburger — opens sidebar on mobile/tablet, toggles collapse on desktop */}
      <button
        onClick={onMenuToggle}
        className="text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer shrink-0"
      >
        <Menu size={24} />
      </button>

      {/* Left content — only rendered when a slot is supplied (e.g. a back
          button on detail pages). Spacer keeps the right side aligned. */}
      {leftSlot ?? <div className="flex-1" />}

      {/* Right side */}
      <div className="flex items-center gap-2 md:gap-3 shrink-0">
        <div className="flex items-center gap-2 md:gap-3">
          <HelpCircle size={20} className="text-[var(--color-icon-secondary)] cursor-pointer hidden md:block" />
          <div className="relative">
            <Bell size={20} className="text-[var(--color-icon-secondary)] cursor-pointer" />
            <div className="absolute -top-1 -right-1 size-3 bg-[var(--color-negative)] rounded-full border-2 border-[var(--color-bg-page)]" />
          </div>
        </div>

        {/* Profile dropdown */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen((o) => !o)}
            className={`flex items-center gap-2 p-2 rounded-xl active:bg-[var(--color-bg-surface)] transition-colors cursor-pointer ${
              profileOpen
                ? "bg-[var(--color-bg-surface)]"
                : "hover:bg-[var(--color-bg-surface)]"
            }`}
          >
            <div className="size-8 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0">
              <span className="text-sm font-medium uppercase text-[var(--color-text-primary)] leading-none">
                KS
              </span>
            </div>
            <div className="flex items-center gap-2 hidden md:flex">
              <span className="text-[var(--color-text-primary)] text-base font-medium">
                Katy Shultz
              </span>
              <ChevronDown size={24} className="text-[var(--color-icon-secondary)]" />
            </div>
          </button>
          {profileOpen && (
            <ProfileDropdown
              onSelect={() => setProfileOpen(false)}
              onSettings={() => onNavigate?.("settings")}
              onSupport={() => onNavigate?.("support")}
              onLogout={onLogout}
            />
          )}
        </div>
      </div>
    </div>
  );
}
