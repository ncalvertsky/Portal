import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal, AlertCircle, Pencil, Eye, EyeOff, Plus, Trash2, X, Sun, Moon, SunMoon } from "lucide-react";
import { useTheme, type ThemeMode } from "../../ThemeContext";
import DashboardLayout from "../layout/DashboardLayout";
import BrandLogo from "../shared/BrandLogo";
import SidebarCTA from "../shared/SidebarCTA";
import Tabs from "../shared/Tabs";
import Tooltip from "../shared/Tooltip";
import CardBrandBadge from "../shared/CardBrandBadge";
import Selector from "../shared/Selector";
import Button from "../shared/Button";
import Tag from "../shared/Tag";
import EditProfileModal from "../shared/EditProfileModal";
import ChangePasswordModal from "../shared/ChangePasswordModal";
import AddPaymentMethodModal from "../shared/AddPaymentMethodModal";
import { settingsNavItems, type PageId } from "../../data/mockData";
import { usePaymentMethods, type PaymentMethod } from "../../PaymentMethodsContext";

type SettingsTab = "profile" | "payment-methods" | "notifications";

const tabs = [
  { id: "profile", label: "Profile" },
  { id: "payment-methods", label: "Payment methods" },
  { id: "notifications", label: "Notifications" },
];

interface SettingsPageProps {
  onNavigate?: (pageId: PageId) => void;
  onLogout?: () => void;
}

export default function SettingsPage({ onNavigate, onLogout }: SettingsPageProps = {}) {
  const [activeTab, setActiveTab] = useState<SettingsTab>("profile");

  return (
    <DashboardLayout
      logo={<BrandLogo />}
      navItems={settingsNavItems}
      sidebarFooter={<SidebarCTA onGetStarted={() => onNavigate?.("merchant-signup")} />}
      showLogout={false}
      onNavigate={onNavigate}
      onLogout={onLogout}
      topBarLeft={
        <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)] flex-1 min-w-0">
          Personal settings
        </h1>
      }
    >
      <Tabs
        tabs={tabs}
        activeId={activeTab}
        onChange={(id) => setActiveTab(id as SettingsTab)}
      />

      <div className="flex-1 min-h-0 overflow-y-auto flex justify-center">
        {activeTab === "profile" && <ProfileTab />}
        {activeTab === "payment-methods" && <PaymentMethodsBlock />}
        {activeTab === "notifications" && <NotificationsTab />}
      </div>
    </DashboardLayout>
  );
}

interface ProfileInfo {
  label: string;
  value: string;
}

const profileInfo: ProfileInfo[] = [
  { label: "Company", value: "Clark Construction" },
  { label: "Email", value: "kshultz@clarkconstruction.com" },
  { label: "Phone", value: "+1 (555) 123-4567" },
  { label: "Address", value: "123 Main St, Suite 100, Nashville, TN 37201" },
];

function ProfileTab() {
  return (
    <div className="w-full max-w-[680px] flex flex-col gap-5 self-start">
      <ProfileBlock />
      <PasswordBlock />
      <ThemeBlock />
    </div>
  );
}

function ProfileBlock() {
  const [editOpen, setEditOpen] = useState(false);
  return (
    <div className="w-full rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] px-6 pt-6 pb-5 flex flex-col gap-4">
      <div className="flex items-start justify-between pb-2">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="size-11 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center shrink-0">
            <span className="text-sm font-medium uppercase text-[var(--color-text-primary)] leading-none tracking-tight">
              KS
            </span>
          </div>
          <span className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none truncate">
            Katy Shultz
          </span>
        </div>
        <Button variant="secondary" icon={Pencil} onClick={() => setEditOpen(true)}>
          Edit profile
        </Button>
      </div>
      <EditProfileModal open={editOpen} onClose={() => setEditOpen(false)} />

      <div className="flex flex-col">
        {profileInfo.map((item, i) => {
          const isFirst = i === 0;
          const isLast = i === profileInfo.length - 1;
          const padding = isFirst ? "pb-4" : isLast ? "pt-4" : "py-4";
          const border = isLast ? "" : "border-b border-[var(--color-border)]";
          return (
            <div
              key={item.label + i}
              className={`flex items-center justify-between ${padding} ${border}`}
            >
              <span className="text-base text-[var(--color-text-secondary)] tracking-tight">
                {item.label}
              </span>
              <span className="text-base text-[var(--color-text-primary)] tracking-tight text-right">
                {item.value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PasswordBlock() {
  const [visible, setVisible] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  return (
    <div className="w-full rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] px-6 pt-6 pb-5 flex flex-col gap-4">
      <div className="flex items-start justify-between pb-2">
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none h-10 flex items-center">
          Password
        </h2>
        <Button variant="secondary" icon={Pencil} onClick={() => setChangeOpen(true)}>
          Change
        </Button>
      </div>
      <ChangePasswordModal open={changeOpen} onClose={() => setChangeOpen(false)} />

      <div className="h-11 rounded-xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-between px-4 py-3">
        <span className="text-base text-[var(--color-text-primary)] font-mono tracking-[0.1em] leading-none select-none">
          {visible ? "hunter2pass!" : "••••••••••••"}
        </span>
        <button
          type="button"
          aria-label={visible ? "Hide password" : "Show password"}
          onClick={() => setVisible((v) => !v)}
          className="text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] transition-colors cursor-pointer"
        >
          {visible ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>
    </div>
  );
}

const THEME_OPTIONS: { mode: ThemeMode; label: string; icon: typeof Sun }[] = [
  { mode: "auto", label: "Auto", icon: SunMoon },
  { mode: "light", label: "Light", icon: Sun },
  { mode: "dark", label: "Dark", icon: Moon },
];

function ThemeBlock() {
  const { themeMode, setThemeMode } = useTheme();
  return (
    <div className="w-full rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] px-6 pt-6 pb-5 flex flex-col gap-4">
      <div className="flex items-start justify-between pb-2">
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none h-10 flex items-center">
          Theme
        </h2>
      </div>

      <div className="flex gap-2 pt-1">
        {THEME_OPTIONS.map(({ mode, label, icon: Icon }) => {
          const active = themeMode === mode;
          return (
            <button
              key={mode}
              type="button"
              onClick={() => setThemeMode(mode)}
              aria-pressed={active}
              className={`size-[100px] rounded-xl border flex flex-col items-center justify-center gap-3 px-4 py-4 transition-colors cursor-pointer ${
                active
                  ? "bg-[var(--color-brand-8)] border-[var(--color-brand)] text-[var(--color-text-primary)]"
                  : "bg-[var(--color-bg-surface)] border-[var(--color-border)] text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
              }`}
            >
              <span className="text-sm font-medium tracking-tight">
                {label}
              </span>
              <Icon size={28} />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PaymentMethodsBlock() {
  const { methods: cards, setDefault, remove } = usePaymentMethods();
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);

  const makeDefault = (id: string) => {
    setDefault(id);
    setOpenMenuId(null);
  };

  const requestDelete = (id: string) => {
    setDeletingId(id);
    setOpenMenuId(null);
  };

  const confirmDelete = () => {
    if (deletingId) {
      remove(deletingId);
    }
    setDeletingId(null);
  };

  return (
    <div className="w-full max-w-[680px] rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] px-6 pt-6 pb-5 flex flex-col gap-4 self-start">
      <div className="flex items-start justify-between pb-2">
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none h-10 flex items-center">
          Cards & Bank accounts
        </h2>
        <Button variant="secondary" icon={Plus} onClick={() => setAddOpen(true)}>
          Add payment method
        </Button>
      </div>
      <AddPaymentMethodModal open={addOpen} onClose={() => setAddOpen(false)} />

      <div className="flex flex-col">
        {cards.map((card, i) => (
          <PaymentMethodRow
            key={card.id}
            card={card}
            isLast={i === cards.length - 1}
            menuOpen={openMenuId === card.id}
            onToggleMenu={() =>
              setOpenMenuId((prev) => (prev === card.id ? null : card.id))
            }
            onCloseMenu={() => setOpenMenuId(null)}
            onMakeDefault={() => makeDefault(card.id)}
            onDelete={() => requestDelete(card.id)}
          />
        ))}
      </div>

      <DeletePaymentMethodModal
        open={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
}

interface PaymentMethodRowProps {
  card: PaymentMethod;
  isLast: boolean;
  menuOpen: boolean;
  onToggleMenu: () => void;
  onCloseMenu: () => void;
  onMakeDefault: () => void;
  onDelete: () => void;
}

function PaymentMethodRow({
  card,
  isLast,
  menuOpen,
  onToggleMenu,
  onCloseMenu,
  onMakeDefault,
  onDelete,
}: PaymentMethodRowProps) {
  return (
    <div
      className={`flex items-center gap-3 h-[52px] p-2 ${
        isLast ? "" : "border-b border-[var(--color-border)]"
      }`}
    >
      <div className="w-[38px] h-9 flex items-center justify-center shrink-0">
        <CardBrandBadge brand={card.brand} size="sm" />
      </div>
      <div className="flex-1 min-w-0 flex items-center gap-2">
        <span className="text-base font-mono text-[var(--color-text-primary)] tabular-nums">
          **** {card.last4}
        </span>
        <span className="size-1 rounded-full bg-[var(--color-icon-secondary)] shrink-0" />
        <span className="text-base font-medium text-[var(--color-text-secondary)] tabular-nums truncate">
          {card.detail}
        </span>
        {card.expired && (
          <Tooltip content="This card is expired. Update it or add a new payment method.">
            <AlertCircle
              size={16}
              className="text-[var(--color-negative)] cursor-help"
            />
          </Tooltip>
        )}
      </div>
      {card.isDefault && (
        <Tag tone="blue" size="sm">Default method</Tag>
      )}
      <PaymentMethodMenu
        open={menuOpen}
        onToggle={onToggleMenu}
        onClose={onCloseMenu}
        onMakeDefault={onMakeDefault}
        onDelete={onDelete}
        isDefault={card.isDefault}
      />
    </div>
  );
}

interface PaymentMethodMenuProps {
  open: boolean;
  onToggle: () => void;
  onClose: () => void;
  onMakeDefault: () => void;
  onDelete: () => void;
  isDefault?: boolean;
}

function PaymentMethodMenu({
  open,
  onToggle,
  onClose,
  onMakeDefault,
  onDelete,
  isDefault,
}: PaymentMethodMenuProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        aria-label="More options"
        onClick={onToggle}
        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
          open
            ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
            : "text-[var(--color-icon-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
        }`}
      >
        <MoreHorizontal size={16} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 z-30 w-[220px] rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[0_16px_32px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)] p-2"
        >
          <button
            type="button"
            role="menuitem"
            onClick={onMakeDefault}
            disabled={isDefault}
            className="w-full flex items-center justify-between gap-2 h-10 px-3 rounded-xl text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
          >
            <span>Default method</span>
          </button>
          <button
            type="button"
            role="menuitem"
            onClick={onDelete}
            className="w-full flex items-center justify-between gap-2 h-10 px-3 rounded-xl text-sm text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
          >
            <span>Delete</span>
            <Trash2 size={16} className="text-[var(--color-negative)]" />
          </button>
        </div>
      )}
    </div>
  );
}

interface DeletePaymentMethodModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function DeletePaymentMethodModal({
  open,
  onClose,
  onConfirm,
}: DeletePaymentMethodModalProps) {
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

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
        aria-hidden
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-pm-title"
        className="relative w-full max-w-[400px] rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[0_16px_32px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)] p-6 flex flex-col gap-6"
      >
        <button
          type="button"
          aria-label="Close"
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-lg text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col gap-2 pr-6">
          <h3
            id="delete-pm-title"
            className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-tight"
          >
            Are you sure you want to delete this payment method?
          </h3>
          <p className="text-sm text-[var(--color-text-secondary)]">
            This action cannot be undone.
          </p>
        </div>

        <Button variant="danger" onClick={onConfirm} className="w-full">
          Delete
        </Button>
      </div>
    </div>,
    document.body
  );
}

interface NotificationRow {
  id: "requests" | "invoices" | "agreements" | "payment-methods";
  title: string;
  description: string;
}

const notificationRows: NotificationRow[] = [
  {
    id: "requests",
    title: "Requests",
    description: "All statuses on requests",
  },
  {
    id: "invoices",
    title: "Invoices",
    description: "All statuses on invoices",
  },
  {
    id: "agreements",
    title: "Agreements",
    description: "All statuses on agreements",
  },
  {
    id: "payment-methods",
    title: "Payment methods",
    description: "Saved method changes and expirations",
  },
];

type Channel = "sms" | "email";

function NotificationsTab() {
  const [prefs, setPrefs] = useState<Record<NotificationRow["id"], Record<Channel, boolean>>>({
    requests: { sms: true, email: true },
    invoices: { sms: true, email: true },
    agreements: { sms: true, email: true },
    "payment-methods": { sms: true, email: true },
  });

  const toggle = (rowId: NotificationRow["id"], channel: Channel) => {
    setPrefs((prev) => ({
      ...prev,
      [rowId]: { ...prev[rowId], [channel]: !prev[rowId][channel] },
    }));
  };

  const toggleAll = (channel: Channel) => {
    const allOn = notificationRows.every((row) => prefs[row.id][channel]);
    setPrefs((prev) => {
      const next = { ...prev };
      for (const row of notificationRows) {
        next[row.id] = { ...next[row.id], [channel]: !allOn };
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-[680px] flex flex-col gap-5 self-start">
      <NotificationPreferencesBlock
        prefs={prefs}
        onToggle={toggle}
        onToggleAll={toggleAll}
      />
    </div>
  );
}

function NotificationPreferencesBlock({
  prefs,
  onToggle,
  onToggleAll,
}: {
  prefs: Record<NotificationRow["id"], Record<Channel, boolean>>;
  onToggle: (rowId: NotificationRow["id"], channel: Channel) => void;
  onToggleAll: (channel: Channel) => void;
}) {
  const allSms = notificationRows.every((row) => prefs[row.id].sms);
  const allEmail = notificationRows.every((row) => prefs[row.id].email);
  return (
    <div className="w-full rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] px-6 pt-6 pb-5 flex flex-col gap-4">
      <div className="flex items-start justify-between pb-2">
        <h2 className="text-xl font-medium tracking-tight text-[var(--color-text-primary)] leading-none h-10 flex items-center">
          Notifications
        </h2>
      </div>

      <div className="flex flex-col">
        <div className="flex items-end border-b border-[var(--color-border)] pb-4">
          <span className="flex-1 text-base text-[var(--color-text-secondary)] tracking-tight">
            Type
          </span>
          <div className="w-[80px] flex flex-col items-center gap-2">
            <span className="text-base text-[var(--color-text-secondary)] tracking-tight">
              SMS
            </span>
            <Selector
              checked={allSms}
              onChange={() => onToggleAll("sms")}
              ariaLabel="Toggle all SMS notifications"
            />
          </div>
          <div className="w-[80px] flex flex-col items-center gap-2">
            <span className="text-base text-[var(--color-text-secondary)] tracking-tight">
              Email
            </span>
            <Selector
              checked={allEmail}
              onChange={() => onToggleAll("email")}
              ariaLabel="Toggle all Email notifications"
            />
          </div>
        </div>

        {notificationRows.map((row, i) => (
          <div
            key={row.id}
            className={`flex items-center ${
              i === notificationRows.length - 1
                ? "pt-4"
                : "py-4 border-b border-[var(--color-border)]"
            }`}
          >
            <div className="flex-1 flex flex-col gap-2">
              <span className="text-base text-[var(--color-text-primary)] tracking-tight">
                {row.title}
              </span>
              <span className="text-base text-[var(--color-text-secondary)] tracking-tight">
                {row.description}
              </span>
            </div>
            <div className="w-[80px] flex items-center justify-center">
              <Selector
                checked={prefs[row.id].sms}
                onChange={() => onToggle(row.id, "sms")}
                ariaLabel={`${row.title} SMS`}
              />
            </div>
            <div className="w-[80px] flex items-center justify-center">
              <Selector
                checked={prefs[row.id].email}
                onChange={() => onToggle(row.id, "email")}
                ariaLabel={`${row.title} Email`}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
