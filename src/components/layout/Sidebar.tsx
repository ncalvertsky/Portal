import {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  MapPin,
  ClipboardList,
  Users2,
  BarChart3,
  Settings,
  LogOut,
  CreditCard,
  FileText,
} from "lucide-react";
import { navItems as defaultNavItems, type NavItem, type NavIconName, type PageId } from "../../data/mockData";
import FractalLogo from "../shared/FractalLogo";
import type { ReactNode } from "react";

const iconMap: Record<NavIconName, React.ComponentType<{ size?: number }>> = {
  LayoutDashboard,
  Users,
  ArrowLeftRight,
  MapPin,
  ClipboardList,
  Users2,
  BarChart3,
  Settings,
  CreditCard,
  FileText,
};

interface SidebarProps {
  onClose?: () => void;
  items?: NavItem[];
  logo?: ReactNode;
  footer?: ReactNode;
  showLogout?: boolean;
  onNavigate?: (pageId: PageId) => void;
  onLogout?: () => void;
}

export default function Sidebar({
  onClose,
  items = defaultNavItems,
  logo,
  footer,
  showLogout = true,
  onNavigate,
  onLogout,
}: SidebarProps) {
  return (
    <aside className="w-[240px] h-full flex flex-col px-4 pb-4 shrink-0 bg-[var(--color-bg-surface)]">
      {/* Logo */}
      <div className="flex items-center pt-5 pb-4 h-[76px] text-[var(--color-text-primary)] pl-3 pr-0">
        {logo ?? <FractalLogo className="h-8 w-auto" />}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col flex-1 justify-between mt-1">
        <div className="flex flex-col">
          {items.map((item) => {
            const Icon = iconMap[item.icon];
            const isActive = item.active;
            return (
              <a
                key={item.label}
                href="#"
                onClick={(e) => {
                  if (item.pageId && onNavigate) {
                    e.preventDefault();
                    onNavigate(item.pageId);
                  }
                  onClose?.();
                }}
                className={`flex items-center gap-2 pl-4 pr-3 py-3 rounded-[var(--radius-md)] border border-transparent transition-colors ${
                  item.pageId ? "cursor-pointer" : ""
                } ${
                  isActive
                    ? "bg-[var(--nav-item-bg-active)] text-[var(--nav-item-text-active)]"
                    : "text-[var(--nav-item-text-default)] hover:bg-[var(--nav-item-bg-hover)] hover:text-[var(--nav-item-text-hover)] active:bg-[var(--nav-item-bg-active)] active:text-[var(--nav-item-text-active)] active:border-[var(--color-border-brand)]"
                }`}
              >
                <Icon size={20} />
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            );
          })}
        </div>

        <div className="flex flex-col gap-2">
          {footer}
          {showLogout && (
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onClose?.();
                onLogout?.();
              }}
              className="flex items-center gap-2 pl-4 pr-3 py-3 rounded-[var(--radius-md)] border border-transparent text-[var(--nav-item-text-default)] hover:bg-[var(--nav-item-bg-hover)] hover:text-[var(--nav-item-text-hover)] active:bg-[var(--nav-item-bg-active)] active:text-[var(--nav-item-text-active)] active:border-[var(--color-border-brand)] transition-colors cursor-pointer"
            >
              <LogOut size={20} />
              <span className="text-sm font-medium">Logout</span>
            </a>
          )}
        </div>
      </nav>
    </aside>
  );
}
