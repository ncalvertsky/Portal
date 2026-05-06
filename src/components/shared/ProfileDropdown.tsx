import { Settings, LogOut, type LucideIcon } from "lucide-react";

interface ProfileDropdownProps {
  onSelect?: () => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

export default function ProfileDropdown({
  onSelect,
  onSettings,
  onLogout,
}: ProfileDropdownProps) {
  return (
    <div className="absolute right-0 top-full mt-2 z-50 w-[280px] rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-[var(--color-border)]">
        <div className="size-11 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0">
          <span className="text-sm font-medium uppercase text-[var(--color-text-primary)] leading-none tracking-tight">
            KS
          </span>
        </div>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <span className="text-base font-medium text-[var(--color-text-primary)] leading-[18px] truncate">
            Katy Shultz
          </span>
          <span className="text-sm text-[var(--color-text-tertiary)] truncate">
            Clark Construction
          </span>
        </div>
      </div>

      {/* Settings */}
      <div className="flex flex-col p-2 border-b border-[var(--color-border)]">
        <MenuItem
          icon={Settings}
          label="Personal settings"
          onClick={() => {
            onSettings?.();
            onSelect?.();
          }}
        />
      </div>

      {/* Logout */}
      <div className="flex flex-col p-2">
        <MenuItem
          icon={LogOut}
          label="Logout"
          onClick={() => {
            onLogout?.();
            onSelect?.();
          }}
        />
      </div>
    </div>
  );
}

function MenuItem({
  icon: Icon,
  label,
  onClick,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-2 h-[52px] p-2 rounded-xl hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer w-full text-left"
    >
      <div className="size-9 rounded-full border border-[var(--color-border)] bg-[var(--color-bg-surface)] flex items-center justify-center text-[var(--color-icon-default)] shrink-0">
        <Icon size={16} />
      </div>
      <span className="flex-1 text-sm text-[var(--color-text-primary)]">
        {label}
      </span>
    </button>
  );
}
