import { useState, type ReactNode } from "react";
import Sidebar from "./Sidebar";
import TopBar from "./TopBar";
import type { NavItem, PageId } from "../../data/mockData";

interface DashboardLayoutProps {
  children: ReactNode;
  navItems?: NavItem[];
  logo?: ReactNode;
  sidebarFooter?: ReactNode;
  showLogout?: boolean;
  onNavigate?: (pageId: PageId) => void;
  onLogout?: () => void;
  topBarLeft?: ReactNode;
}

export default function DashboardLayout({
  children,
  navItems,
  logo,
  sidebarFooter,
  showLogout,
  onNavigate,
  onLogout,
  topBarLeft,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const handleMenuToggle = () => {
    if (typeof window !== "undefined" && window.matchMedia("(min-width: 1024px)").matches) {
      setDesktopCollapsed((c) => !c);
    } else {
      setSidebarOpen(true);
    }
  };

  return (
    // Outer container clips the wrapper when it translates past the viewport,
    // so the "push" doesn't introduce horizontal page scroll on mobile.
    <div className="h-screen overflow-hidden">
      <div
        className={`flex h-screen transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen ? "translate-x-[240px]" : "translate-x-0"
        }`}
      >
        {/* Mobile/Tablet sidebar — laid out as a flex child but pulled
            offscreen with a negative margin. When the wrapper translates
            right, the sidebar slides into view and main content is pushed
            right with it (the classic "push drawer" pattern). */}
        <div className="lg:hidden -ml-[240px] w-[240px] flex-none">
          <Sidebar
            items={navItems}
            logo={logo}
            footer={sidebarFooter}
            showLogout={showLogout}
            onClose={() => setSidebarOpen(false)}
            onNavigate={onNavigate}
            onLogout={onLogout}
          />
        </div>

        {/* Desktop sidebar — slides off to the left when collapsed */}
        <div
          className={`hidden lg:flex transition-[margin-left] duration-300 ease-in-out ${
            desktopCollapsed ? "-ml-[240px]" : "ml-0"
          }`}
        >
          <Sidebar
            items={navItems}
            logo={logo}
            footer={sidebarFooter}
            showLogout={showLogout}
            onNavigate={onNavigate}
            onLogout={onLogout}
          />
        </div>

        <main className="flex-1 flex flex-col gap-3 xl:gap-4 p-3 xl:p-4 overflow-hidden min-w-0 bg-[var(--color-bg-page)] lg:rounded-l-2xl relative">
          <TopBar
            onMenuToggle={handleMenuToggle}
            onNavigate={onNavigate}
            onLogout={onLogout}
            leftSlot={topBarLeft}
          />
          {/* The page area is the vertical scroll container at every breakpoint
              so children can use `position: sticky` to pin sub-sections — most
              notably the agreements/payments tabs that stay at the top while
              the overview cards scroll out of view. */}
          <div className="flex-1 min-h-0 flex flex-col gap-3 xl:gap-4 overflow-y-auto">
            {children}
          </div>

          {/* Compliance disclosure — pinned below the scroll area so it
              stays visible on every page. Intentionally subdued (text-tertiary
              at ~43% opacity) per the Figma. */}
          <p className="shrink-0 px-[31px] text-center text-xs leading-4 tracking-tight text-[var(--color-text-tertiary)] opacity-[0.43] truncate">
            Outpave partners with Highnote Payments Company for money
            transmission services and account services with funds held at Fifth
            Third Bank N.A., Member FDIC.{" "}
            <a
              href="https://brandfetch.com/developers/logo-api"
              target="_blank"
              rel="noopener noreferrer"
              className="underline hover:text-[var(--color-text-primary)] transition-colors"
            >
              Logos by Brandfetch.
            </a>
          </p>

          {/* Backdrop over the (pushed) main content — tap to close. Sits
              inside main so it translates with the rest of the page. */}
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setSidebarOpen(false)}
            className={`absolute inset-0 z-50 bg-black/50 transition-opacity duration-300 lg:hidden ${
              sidebarOpen
                ? "opacity-100 cursor-pointer"
                : "opacity-0 pointer-events-none"
            }`}
          />
        </main>
      </div>
    </div>
  );
}
