import { useEffect } from "react";
import {
  ArrowUpRight,
  ChevronDown,
  CreditCard,
  Layers,
  Settings,
  Smartphone,
  type LucideIcon,
} from "lucide-react";
import BrandLogo from "../shared/BrandLogo";
import { BRAND_LABELS, useTheme, type Brand } from "../../ThemeContext";

/**
 * Internal "pick a prototype" landing screen. Only the Customer Portal is
 * clickable — the rest are placeholders so the grid feels like a real
 * project picker without committing to building them.
 */

interface ProjectsPageProps {
  onSelect: (id: ProjectId) => void;
}

export type ProjectId = "customer-portal" | "fractal-settings";

interface Project {
  id: ProjectId | string;
  /** Only `live` projects are clickable. */
  status: "live" | "soon";
  title: string;
  blurb: string;
  icon: LucideIcon;
  /** Tone for the icon container — picked per-card to give the grid some
   *  visual variety without screenshots. */
  tone: "brand" | "blue" | "violet" | "teal";
}

const PROJECTS: Project[] = [
  {
    id: "customer-portal",
    status: "live",
    title: "Customer Portal",
    blurb:
      "Where Outpave customers pay invoices, sign agreements, and manage payment methods.",
    icon: CreditCard,
    tone: "brand",
  },
  {
    id: "fractal-settings",
    status: "live",
    title: "Fractal Settings",
    blurb:
      "Org-level settings, billing, members, and integrations for the Fractal workspace.",
    icon: Settings,
    tone: "violet",
  },
  {
    id: "outpave-platform",
    status: "soon",
    title: "Outpave Platform",
    blurb:
      "The merchant-facing app — sending invoices, tracking payouts, and managing the team.",
    icon: Layers,
    tone: "blue",
  },
  {
    id: "mobile-app",
    status: "soon",
    title: "Mobile App",
    blurb:
      "iOS + Android shell for paying invoices on the go and authenticating with biometrics.",
    icon: Smartphone,
    tone: "teal",
  },
];

const TONE_CLASSES: Record<Project["tone"], string> = {
  brand:
    "bg-[var(--color-brand-8)] border-[var(--color-border-brand)] text-[var(--color-brand)]",
  blue: "bg-[rgba(59,130,246,0.10)] border-[rgba(59,130,246,0.45)] text-[rgb(96,165,250)]",
  violet:
    "bg-[rgba(168,85,247,0.10)] border-[rgba(168,85,247,0.45)] text-[rgb(192,132,252)]",
  teal: "bg-[rgba(20,184,166,0.10)] border-[rgba(20,184,166,0.45)] text-[rgb(45,212,191)]",
};

export default function ProjectsPage({ onSelect }: ProjectsPageProps) {
  // The picker dashboard is always shown in dark mode regardless of the
  // user's chosen theme — restored on unmount so opening a prototype
  // returns to whatever they had set.
  const { themeMode, setThemeMode } = useTheme();
  useEffect(() => {
    const previous = themeMode;
    setThemeMode("dark");
    return () => setThemeMode(previous);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-[var(--color-bg-page)] flex flex-col">
      <header className="shrink-0 max-w-[1280px] w-full mx-auto px-6 md:px-10 py-5 flex items-center justify-between gap-4">
        <BrandLogo className="h-8 w-auto" />
        <div className="flex items-center gap-3">
          <span className="hidden md:inline text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
            Internal · Prototypes
          </span>
          <BrandPicker />
        </div>
      </header>

      <main className="flex-1 max-w-[1280px] w-full mx-auto px-6 md:px-10 pb-20 flex flex-col gap-10">
        <section className="flex flex-col gap-3 max-w-[680px]">
          <h1 className="text-[40px] md:text-[48px] font-medium tracking-tight text-[var(--color-text-primary)] leading-[1.05]">
            Prototypes
          </h1>
          <p className="text-base text-[var(--color-text-secondary)] leading-snug">
            Pick a project to open. The Customer Portal is the only one
            currently wired up — the others are placeholders for upcoming
            work.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PROJECTS.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={
                project.status === "live"
                  ? () => onSelect(project.id as ProjectId)
                  : undefined
              }
            />
          ))}
        </section>
      </main>
    </div>
  );
}

function ProjectCard({
  project,
  onClick,
}: {
  project: Project;
  onClick?: () => void;
}) {
  const Icon = project.icon;
  const live = project.status === "live";
  const interactive = !!onClick;

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!interactive}
      className={`group text-left flex flex-col gap-5 p-5 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] transition-colors ${
        interactive
          ? "hover:border-[var(--color-border-brand)] hover:bg-[var(--color-bg-elevated)] cursor-pointer"
          : "opacity-60 cursor-not-allowed"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div
          className={`size-12 rounded-2xl border flex items-center justify-center shrink-0 ${TONE_CLASSES[project.tone]}`}
        >
          <Icon size={22} />
        </div>
        <StatusPill live={live} />
      </div>

      <div className="flex flex-col gap-1.5">
        <h2 className="text-lg font-medium tracking-tight text-[var(--color-text-primary)] leading-none">
          {project.title}
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] leading-snug">
          {project.blurb}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-border)]">
        <span
          className={`text-sm font-semibold ${
            interactive
              ? "text-[var(--color-brand)]"
              : "text-[var(--color-text-tertiary)]"
          }`}
        >
          {interactive ? "Open" : "Coming soon"}
        </span>
        {interactive && (
          <ArrowUpRight
            size={16}
            className="text-[var(--color-brand)] transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
          />
        )}
      </div>
    </button>
  );
}

function StatusPill({ live }: { live: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 h-6 rounded-full text-[11px] font-medium uppercase tracking-wider ${
        live
          ? "bg-[var(--color-brand-8)] text-[var(--color-brand)] border border-[var(--color-border-brand)]"
          : "bg-[var(--color-bg-elevated)] text-[var(--color-text-tertiary)] border border-[var(--color-border)]"
      }`}
    >
      <span
        className={`size-1.5 rounded-full ${
          live ? "bg-[var(--color-brand)]" : "bg-[var(--color-text-tertiary)]"
        }`}
      />
      {live ? "In progress" : "Soon"}
    </span>
  );
}

/** Internal brand-mode switcher. Native <select> styled to match the chip in
 *  the header — no popover machinery needed for an internal control. */
function BrandPicker() {
  const { brand, setBrand } = useTheme();
  const brands: Brand[] = ["outpave", "white-label", "skyos", "fractal"];
  return (
    <label className="relative inline-flex items-center gap-2 h-8 pl-3 pr-2 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer">
      <span className="text-xs font-medium text-[var(--color-text-tertiary)]">
        Brand
      </span>
      <span className="text-xs font-medium text-[var(--color-text-primary)]">
        {BRAND_LABELS[brand]}
      </span>
      <ChevronDown
        size={14}
        className="text-[var(--color-icon-secondary)]"
      />
      <select
        value={brand}
        onChange={(e) => setBrand(e.target.value as Brand)}
        aria-label="Brand"
        className="absolute inset-0 opacity-0 cursor-pointer"
      >
        {brands.map((b) => (
          <option key={b} value={b}>
            {BRAND_LABELS[b]}
          </option>
        ))}
      </select>
    </label>
  );
}
