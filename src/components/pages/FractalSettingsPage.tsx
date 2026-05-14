import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type ReactNode,
} from "react";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  CreditCard,
  HelpCircle,
  LayoutDashboard,
  Menu,
  Moon,
  Plus,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";
import FractalLogo from "../shared/FractalLogo";
import Button from "../shared/Button";
import Toast from "../shared/Toast";
import {
  CORNER_RADIUS_OPTIONS,
  useTheme,
  type WhiteLabelTheme,
} from "../../ThemeContext";
import {
  hexToHsl,
  hexToRgb,
  hslToHex,
  hsvToRgb,
  normalizeHex,
  rgbToHex,
  rgbToHsv,
  type HSV,
} from "../../lib/color";

/**
 * Fractal Settings — internal admin tool for configuring a customer portal's
 * white-label theme. Sidebar shows the Fractal product nav; the main area
 * holds the "Customer portal" settings tab with Logo + Brand color controls
 * on the left and a live preview on the right.
 *
 * Local state only — Reset returns to the seeded Silvi defaults; Save is
 * UI-only (no backend wiring yet).
 */

interface FractalSettingsPageProps {
  onExit: () => void;
}

// Local-state shape for the color pickers — the two color fields from
// WhiteLabelTheme. Logos + corner radius live in their own state vars.
type BrandColors = Pick<WhiteLabelTheme, "primary" | "background">;

const DEFAULT_BRAND: BrandColors = {
  primary: "F59E0B",
  background: "0D1E28",
};
const DEFAULT_RADIUS = 8;

export default function FractalSettingsPage({ onExit }: FractalSettingsPageProps) {
  const { brand, setBrand, whiteLabelTheme, setWhiteLabelTheme } = useTheme();

  // The Settings page is always shown in the Fractal brand chrome regardless
  // of what the user picked from the prototype switcher — this is the
  // Fractal admin tool, even when it's editing the white-label theme.
  // Restored on unmount so the user lands back on whatever they had set.
  useEffect(() => {
    const previous = brand;
    setBrand("fractal");
    return () => setBrand(previous);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Logos are stored as data URLs so the preview / live cards render the
  // uploaded image without a network round-trip. `null` means "fall back to
  // the seeded Silvi mark". Seeded from the saved white-label theme so
  // re-opening the page shows the persisted uploads.
  const [lightLogo, setLightLogo] = useState<string | null>(
    () => whiteLabelTheme?.lightLogo ?? null,
  );
  const [darkLogo, setDarkLogo] = useState<string | null>(
    () => whiteLabelTheme?.darkLogo ?? null,
  );
  const [favicon, setFavicon] = useState<string | null>(
    () => whiteLabelTheme?.favicon ?? null,
  );
  // Seed the local color + radius state from the saved white-label theme
  // if one exists — otherwise fall back to the defaults baked into this
  // file.
  const [colors, setColors] = useState<BrandColors>(() =>
    whiteLabelTheme
      ? {
          primary: whiteLabelTheme.primary,
          background: whiteLabelTheme.background,
        }
      : DEFAULT_BRAND,
  );
  const [cornerRadius, setCornerRadius] = useState<number>(
    () => whiteLabelTheme?.cornerRadius ?? DEFAULT_RADIUS,
  );
  const [previewMode, setPreviewMode] = useState<"light" | "dark">("dark");
  // Save confirmation toast — set briefly to true on Save, auto-dismisses
  // via the Toast's built-in timer.
  const [savedToast, setSavedToast] = useState(false);

  const setColor = <K extends keyof BrandColors>(key: K, value: string) =>
    setColors((prev) => ({ ...prev, [key]: value }));

  const save = () => {
    setWhiteLabelTheme({
      ...colors,
      cornerRadius,
      lightLogo,
      darkLogo,
      favicon,
    });
    // Re-trigger the toast even on rapid successive saves by closing first.
    setSavedToast(false);
    requestAnimationFrame(() => setSavedToast(true));
  };

  const reset = () => {
    setLightLogo(null);
    setDarkLogo(null);
    setFavicon(null);
    setColors(DEFAULT_BRAND);
    setCornerRadius(DEFAULT_RADIUS);
    // Clear the runtime override so the white-label brand snaps back to the
    // values declared in index.css.
    setWhiteLabelTheme(null);
  };

  return (
    <div className="h-screen flex bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] overflow-hidden">
      <Toast
        open={savedToast}
        message="White-label theme saved"
        onClose={() => setSavedToast(false)}
      />
      <FractalSidebar onExit={onExit} />
      <main className="flex-1 flex flex-col gap-3 p-3 overflow-hidden min-w-0 bg-[var(--color-bg-page)] lg:rounded-l-2xl">
        <FractalTopBar />

        <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4">
          <div className="flex items-center border-b border-[var(--color-border)] px-1">
            <SettingsTab label="General" />
            <SettingsTab label="Notifications" />
            <SettingsTab label="Customer portal" active />
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-[1.15fr_1fr] gap-4">
            <SettingsCard>
              <LogosSection
                lightLogo={lightLogo}
                darkLogo={darkLogo}
                favicon={favicon}
                onLightLogo={setLightLogo}
                onDarkLogo={setDarkLogo}
                onFavicon={setFavicon}
              />
              <div className="h-px bg-[var(--color-border)] my-1" />
              <BrandColorsSection colors={colors} onChange={setColor} />
              <div className="h-px bg-[var(--color-border)] my-1" />
              <CornerRadiusSection
                value={cornerRadius}
                onChange={setCornerRadius}
              />
            </SettingsCard>

            <SettingsCard>
              <LivePreviewSection
                colors={colors}
                cornerRadius={cornerRadius}
                lightLogo={lightLogo}
                darkLogo={darkLogo}
                mode={previewMode}
                onModeChange={setPreviewMode}
              />
            </SettingsCard>
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--color-border)]">
            <Button variant="secondary" onClick={reset}>
              Reset
            </Button>
            <Button variant="primary" onClick={save}>
              Save changes
            </Button>
          </div>

          <p className="text-center text-xs text-[var(--color-text-tertiary)] opacity-60 truncate px-8">
            Outpave partners with Highnote Payments Company for money
            transmission services and account services with funds held at Fifth
            Third Bank N.A., Member FDIC.
          </p>
        </div>
      </main>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Sidebar                                                                    */
/* -------------------------------------------------------------------------- */

interface SidebarItem {
  icon: LucideIcon;
  label: string;
  active?: boolean;
}

const SIDEBAR_ITEMS: SidebarItem[] = [
  { icon: CreditCard, label: "Easypay", active: true },
  { icon: Users, label: "Customers" },
  { icon: LayoutDashboard, label: "Dashboard" },
];

function FractalSidebar({ onExit }: { onExit: () => void }) {
  const { theme, setThemeMode } = useTheme();
  return (
    <aside className="w-[240px] shrink-0 hidden lg:flex flex-col p-4 bg-[var(--color-bg-surface)]">
      <div className="px-3 py-5">
        <FractalLogo className="h-8 w-auto" />
      </div>

      <nav className="flex flex-col gap-1 mt-2">
        {SIDEBAR_ITEMS.map((item) => (
          <SidebarItemButton key={item.label} item={item} />
        ))}
      </nav>

      <div className="mt-auto flex flex-col gap-3">
        <ThemeModeToggle
          mode={theme}
          onChange={(m) => setThemeMode(m)}
        />
        <button
          type="button"
          onClick={onExit}
          className="self-start inline-flex items-center gap-1.5 px-3 h-8 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          Projects
        </button>
      </div>
    </aside>
  );
}

/** Two-button segmented Sun/Moon pill that swaps the app theme. Lives at
 *  the bottom of the Fractal sidebar so the admin can preview their
 *  white-label edits in either mode without leaving the page. */
function ThemeModeToggle({
  mode,
  onChange,
}: {
  mode: "light" | "dark";
  onChange: (m: "light" | "dark") => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-1 p-1 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
      {(
        [
          { id: "light" as const, Icon: Sun, label: "Light mode" },
          { id: "dark" as const, Icon: Moon, label: "Dark mode" },
        ]
      ).map(({ id, Icon, label }) => {
        const active = mode === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-label={label}
            aria-pressed={active}
            className={`flex items-center justify-center h-7 rounded-full text-xs font-medium transition-colors cursor-pointer ${
              active
                ? "bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]"
                : "text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)]"
            }`}
          >
            <Icon size={14} />
          </button>
        );
      })}
    </div>
  );
}

function SidebarItemButton({ item }: { item: SidebarItem }) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      className={`flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
        item.active
          ? "bg-[var(--color-brand-20)] text-[var(--color-text-primary)]"
          : "text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-elevated)] hover:text-[var(--color-text-primary)]"
      }`}
    >
      <Icon size={18} />
      {item.label}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Top bar                                                                    */
/* -------------------------------------------------------------------------- */

function FractalTopBar() {
  return (
    <div className="flex items-center justify-between h-12 shrink-0 gap-3 px-1">
      <div className="flex items-center gap-3">
        <button className="text-[var(--color-icon-secondary)] hover:text-[var(--color-text-primary)] cursor-pointer lg:hidden">
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-medium tracking-tight text-[var(--color-text-primary)]">
          Settings
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <HelpCircle size={20} className="text-[var(--color-icon-secondary)] cursor-pointer" />
        <div className="relative">
          <Bell size={20} className="text-[var(--color-icon-secondary)] cursor-pointer" />
          <span className="absolute -top-1 -right-1 size-3 bg-[var(--color-negative)] rounded-full border-2 border-[var(--color-bg-page)]" />
        </div>
        <button
          type="button"
          className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-[var(--color-bg-surface)] transition-colors cursor-pointer"
        >
          <span className="size-8 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center text-sm font-medium text-[var(--color-text-primary)]">
            KS
          </span>
          <span className="text-sm font-medium text-[var(--color-text-primary)] hidden md:inline">
            Silvi Materials
          </span>
          <ChevronDown size={16} className="text-[var(--color-icon-secondary)]" />
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Tabs                                                                       */
/* -------------------------------------------------------------------------- */

function SettingsTab({ label, active }: { label: string; active?: boolean }) {
  return (
    <button
      type="button"
      className={`relative px-4 pb-3 text-sm font-medium tracking-tight transition-colors cursor-pointer ${
        active
          ? "text-[var(--color-brand)]"
          : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
      }`}
    >
      {label}
      {active && (
        <span className="absolute bottom-[-1px] left-0 right-0 h-[2px] bg-[var(--color-brand)]" />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Card shell                                                                 */
/* -------------------------------------------------------------------------- */

function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <div className="rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] p-6 flex flex-col gap-5">
      {children}
    </div>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <h2 className="text-lg font-medium tracking-tight text-[var(--color-text-primary)]">
        {title}
      </h2>
      <p className="text-sm text-[var(--color-text-tertiary)] leading-snug">
        {subtitle}
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Logos section                                                              */
/* -------------------------------------------------------------------------- */

function LogosSection({
  lightLogo,
  darkLogo,
  favicon,
  onLightLogo,
  onDarkLogo,
  onFavicon,
}: {
  lightLogo: string | null;
  darkLogo: string | null;
  favicon: string | null;
  onLightLogo: (v: string | null) => void;
  onDarkLogo: (v: string | null) => void;
  onFavicon: (v: string | null) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Logos"
        subtitle="Upload your brand logos. PNG or SVG, transparent background recommended. Max 2 MB."
      />
      <div className="grid grid-cols-3 gap-4">
        <LogoUploadCell
          variant="light"
          value={lightLogo}
          onChange={onLightLogo}
        />
        <LogoUploadCell
          variant="dark"
          value={darkLogo}
          onChange={onDarkLogo}
        />
        <FaviconUploadCell value={favicon} onChange={onFavicon} />
      </div>
    </div>
  );
}

/** Read a File and resolve to a data URL. */
function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB cap from the section subtitle.

async function readFile(
  e: ChangeEvent<HTMLInputElement>,
  onChange: (v: string | null) => void,
) {
  const file = e.target.files?.[0];
  e.target.value = ""; // allow re-upload of the same file
  if (!file) return;
  if (file.size > MAX_BYTES) {
    alert("File too large — max 2 MB.");
    return;
  }
  const url = await fileToDataUrl(file);
  onChange(url);
}

/** Recommended logo dimensions surfaced as the size hint in the empty
 *  state. Wordmark-friendly aspect ratio (~4:1). */
const LOGO_SIZE_HINT = "240×60 PNG or SVG";

function LogoUploadCell({
  variant,
  value,
  onChange,
}: {
  variant: "light" | "dark";
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isDark = variant === "dark";
  return (
    <div className="flex flex-col gap-3">
      <span className="text-sm font-medium text-[var(--color-text-primary)]">
        {isDark ? "Dark logo" : "Light logo"}
      </span>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`group h-[100px] rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer overflow-hidden ${
          value
            ? "border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
            : "border-[var(--color-border-strong)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
        }`}
      >
        {value ? (
          <img
            src={value}
            alt={`${variant} logo preview`}
            className="max-h-[68px] max-w-[140px] object-contain"
          />
        ) : (
          <>
            <Plus size={20} />
            <span className="text-sm font-medium">Click to upload</span>
            <span className="text-[11px]">{LOGO_SIZE_HINT}</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/svg+xml,image/png"
          className="hidden"
          onChange={(e) => readFile(e, onChange)}
        />
      </button>
      <div className="flex items-center gap-3 text-sm font-medium">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="text-[var(--color-text-primary)] hover:text-[var(--color-brand)] transition-colors cursor-pointer"
        >
          Replace
        </button>
        <button
          type="button"
          onClick={() => onChange(null)}
          disabled={!value}
          className="text-[var(--color-text-tertiary)] hover:text-[var(--color-negative)] transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function FaviconUploadCell({
  value,
  onChange,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          Favicon
        </span>
        {value && (
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-xs font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-negative)] transition-colors cursor-pointer"
          >
            Remove
          </button>
        )}
      </div>
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={`group h-[100px] rounded-xl border border-dashed flex flex-col items-center justify-center gap-1 transition-colors cursor-pointer ${
          value
            ? "border-[var(--color-border)] bg-[var(--color-bg-elevated)]"
            : "border-[var(--color-border-strong)] text-[var(--color-text-tertiary)] hover:text-[var(--color-text-primary)] hover:border-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
        }`}
      >
        {value ? (
          <img
            src={value}
            alt="Favicon preview"
            className="size-8 object-contain"
          />
        ) : (
          <>
            <Plus size={20} />
            <span className="text-sm font-medium">Click to upload</span>
            <span className="text-[11px]">32×32 SVG/PNG</span>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/svg+xml,image/png"
          className="hidden"
          onChange={(e) => readFile(e, onChange)}
        />
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Brand colors section                                                       */
/* -------------------------------------------------------------------------- */

interface BrandColorMeta {
  key: keyof BrandColors;
  label: string;
  blurb: string;
}

const BRAND_COLOR_META: BrandColorMeta[] = [
  {
    key: "primary",
    label: "Primary",
    blurb: "Buttons, links, focus rings, and headers.",
  },
  {
    key: "background",
    label: "Background",
    blurb: "Page, cards, borders, and surface elements.",
  },
];

function BrandColorsSection({
  colors,
  onChange,
}: {
  colors: BrandColors;
  onChange: <K extends keyof BrandColors>(key: K, value: string) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Brand colors"
        subtitle="Two colors drive the app. Primary anchors interactive surfaces; background anchors the canvas. Tints, hovers, and focus rings derive from primary."
      />
      <div className="flex flex-col gap-2">
        {BRAND_COLOR_META.map((meta) => (
          <BrandColorRow
            key={meta.key}
            meta={meta}
            value={colors[meta.key]}
            onChange={(v) => onChange(meta.key, v)}
          />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Corner radius section                                                      */
/* -------------------------------------------------------------------------- */

function CornerRadiusSection({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <SectionHeader
        title="Corner radius"
        subtitle="Sets the rounding scale across the app — buttons, cards, modals, and inputs all derive their radius from this baseline."
      />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {CORNER_RADIUS_OPTIONS.map((opt) => (
          <CornerRadiusOption
            key={opt.id}
            label={opt.label}
            radius={opt.value}
            selected={value === opt.value}
            onClick={() => onChange(opt.value)}
          />
        ))}
      </div>
    </div>
  );
}

function CornerRadiusOption({
  label,
  radius,
  selected,
  onClick,
}: {
  label: string;
  radius: number;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl border transition-colors cursor-pointer text-left ${
        selected
          ? "border-[var(--color-border-focus)] bg-[var(--color-brand-8)]"
          : "border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)]"
      }`}
    >
      <span
        className="size-9 shrink-0 bg-[var(--color-brand)]"
        style={{ borderRadius: `${radius}px` }}
        aria-hidden
      />
      <span className="flex flex-col min-w-0">
        <span className="text-[13px] font-medium text-[var(--color-text-primary)] leading-tight">
          {label}
        </span>
        <span className="text-[11px] text-[var(--color-text-tertiary)] leading-tight">
          {radius}px
        </span>
      </span>
    </button>
  );
}

function BrandColorRow({
  meta,
  value,
  onChange,
}: {
  meta: BrandColorMeta;
  value: string;
  onChange: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const [pickerOpen, setPickerOpen] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  useEffect(() => setDraft(value), [value]);

  // Close picker on outside click / Escape.
  useEffect(() => {
    if (!pickerOpen) return;
    const onDoc = (e: MouseEvent) => {
      if (rowRef.current && !rowRef.current.contains(e.target as Node)) {
        setPickerOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setPickerOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [pickerOpen]);

  const commit = (next: string) => {
    if (next.length === 6) onChange(next);
    else setDraft(value);
  };

  return (
    <div
      ref={rowRef}
      className="relative flex items-center gap-3 p-3 rounded-xl border border-[var(--color-border)] hover:bg-[var(--color-bg-elevated)] transition-colors"
    >
      <button
        type="button"
        onClick={() => setPickerOpen((o) => !o)}
        aria-label={`Edit ${meta.label} color`}
        aria-expanded={pickerOpen}
        className={`size-9 rounded-lg shrink-0 border cursor-pointer transition-shadow ${
          pickerOpen
            ? "border-[var(--color-border-focus)] shadow-[0_0_0_3px_var(--color-brand-20)]"
            : "border-[var(--color-border)] hover:border-[var(--color-border-strong)]"
        }`}
        style={{ backgroundColor: `#${value}` }}
      />
      <div className="flex-1 min-w-0 flex flex-col gap-0.5">
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {meta.label}
        </span>
        <span className="text-xs text-[var(--color-text-tertiary)]">
          {meta.blurb}
        </span>
      </div>
      <div className="flex items-center gap-1 px-2 h-8 rounded-lg bg-[var(--color-bg-elevated)] border border-[var(--color-border)] font-mono text-sm tabular-nums focus-within:border-[var(--color-border-focus)]">
        <span className="text-[var(--color-text-tertiary)]">#</span>
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(normalizeHex(e.target.value))}
          onBlur={(e) => commit(normalizeHex(e.target.value))}
          onKeyDown={(e) => {
            if (e.key === "Enter") e.currentTarget.blur();
          }}
          maxLength={6}
          className="w-[60px] bg-transparent outline-none text-[var(--color-text-primary)] uppercase"
          spellCheck={false}
          aria-label={`${meta.label} hex value`}
        />
      </div>

      {pickerOpen && (
        <ColorPickerPopover
          value={value}
          onChange={onChange}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Color picker popover                                                       */
/* -------------------------------------------------------------------------- */

const PRESET_SWATCHES = [
  "F59E0B", "EF4444", "F472B6", "A855F7", "6366F1", "0EA5E9", "10B981", "84CC16",
  "FACC15", "FB923C", "EC4899", "8B5CF6", "3B82F6", "06B6D4", "14B8A6", "22C55E",
  "0D1E28", "1F2937", "475569", "94A3B8", "CBD5E1", "E5E7EB", "F8FAFC", "FFFFFF",
];

function ColorPickerPopover({
  value,
  onChange,
  onClose,
}: {
  value: string;
  onChange: (v: string) => void;
  onClose: () => void;
}) {
  // Track HSV locally so dragging doesn't lose hue when saturation hits 0
  // (the rgb→hsv round-trip would otherwise reset it).
  const [hsv, setHsv] = useState<HSV>(() => rgbToHsv(hexToRgb(value)));
  const [hexDraft, setHexDraft] = useState(value);
  const svRef = useRef<HTMLDivElement>(null);
  const hueRef = useRef<HTMLDivElement>(null);

  // Push every HSV change up to the parent as a hex.
  useEffect(() => {
    const next = rgbToHex(hsvToRgb(hsv));
    setHexDraft(next);
    if (next !== value) onChange(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hsv]);

  // External value changes (Reset, hex input typing) should refresh HSV.
  useEffect(() => {
    const next = rgbToHsv(hexToRgb(value));
    setHsv((prev) => {
      if (
        Math.abs(prev.h - next.h) < 0.5 &&
        Math.abs(prev.s - next.s) < 0.005 &&
        Math.abs(prev.v - next.v) < 0.005
      ) {
        return prev;
      }
      return next;
    });
    setHexDraft(value);
  }, [value]);

  // Drag helpers — bind once when the user mousedowns on the picker surface.
  const startSvDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const update = (clientX: number, clientY: number) => {
      if (!svRef.current) return;
      const rect = svRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      const y = Math.max(0, Math.min(rect.height, clientY - rect.top));
      setHsv((prev) => ({ ...prev, s: x / rect.width, v: 1 - y / rect.height }));
    };
    update(e.clientX, e.clientY);
    const onMove = (ev: MouseEvent) => update(ev.clientX, ev.clientY);
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const startHueDrag = (e: React.MouseEvent) => {
    e.preventDefault();
    const update = (clientX: number) => {
      if (!hueRef.current) return;
      const rect = hueRef.current.getBoundingClientRect();
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      setHsv((prev) => ({ ...prev, h: (x / rect.width) * 360 }));
    };
    update(e.clientX);
    const onMove = (ev: MouseEvent) => update(ev.clientX);
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  const commitHex = () => {
    const cleaned = normalizeHex(hexDraft);
    if (cleaned.length === 6) {
      setHsv(rgbToHsv(hexToRgb(cleaned)));
      onChange(cleaned);
    } else {
      setHexDraft(value);
    }
  };

  return (
    <div
      role="dialog"
      aria-label="Color picker"
      className="absolute z-50 right-0 bottom-[calc(100%+8px)] w-[260px] p-3 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] shadow-[0_16px_32px_rgba(0,0,0,0.1),0_4px_8px_rgba(0,0,0,0.08)] flex flex-col gap-3"
    >
      {/* SV picker */}
      <div
        ref={svRef}
        onMouseDown={startSvDrag}
        className="relative h-[150px] w-full rounded-lg cursor-crosshair select-none overflow-hidden"
        style={{
          backgroundImage:
            "linear-gradient(to bottom, transparent, #000)," +
            `linear-gradient(to right, #fff, hsl(${hsv.h}, 100%, 50%))`,
        }}
      >
        <span
          aria-hidden
          className="absolute size-4 -translate-x-1/2 -translate-y-1/2 border-2 border-white rounded-full pointer-events-none shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{
            left: `${hsv.s * 100}%`,
            top: `${(1 - hsv.v) * 100}%`,
            backgroundColor: `#${rgbToHex(hsvToRgb(hsv))}`,
          }}
        />
      </div>

      {/* Hue slider */}
      <div
        ref={hueRef}
        onMouseDown={startHueDrag}
        className="relative h-3 w-full rounded-full cursor-ew-resize select-none"
        style={{
          background:
            "linear-gradient(to right, hsl(0,100%,50%), hsl(60,100%,50%), hsl(120,100%,50%), hsl(180,100%,50%), hsl(240,100%,50%), hsl(300,100%,50%), hsl(360,100%,50%))",
        }}
      >
        <span
          aria-hidden
          className="absolute top-1/2 size-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white pointer-events-none shadow-[0_0_0_1px_rgba(0,0,0,0.4)]"
          style={{
            left: `${(hsv.h / 360) * 100}%`,
            backgroundColor: `hsl(${hsv.h}, 100%, 50%)`,
          }}
        />
      </div>

      {/* Hex input + current swatch */}
      <div className="flex items-center gap-2">
        <span
          className="size-8 rounded-md border border-[var(--color-border)] shrink-0"
          style={{ backgroundColor: `#${hexDraft}` }}
        />
        <div className="flex-1 flex items-center gap-1 px-2 h-8 rounded-md bg-[var(--color-bg-elevated)] border border-[var(--color-border)] font-mono text-sm tabular-nums focus-within:border-[var(--color-border-focus)]">
          <span className="text-[var(--color-text-tertiary)]">#</span>
          <input
            type="text"
            value={hexDraft}
            onChange={(e) => setHexDraft(normalizeHex(e.target.value))}
            onBlur={commitHex}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.currentTarget.blur();
                onClose();
              }
            }}
            maxLength={6}
            spellCheck={false}
            aria-label="Hex color value"
            className="flex-1 min-w-0 bg-transparent outline-none text-[var(--color-text-primary)] uppercase"
          />
        </div>
      </div>

      {/* Preset swatches */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[11px] font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
          Presets
        </span>
        <div className="grid grid-cols-8 gap-1">
          {PRESET_SWATCHES.map((p) => {
            const active = p === value;
            return (
              <button
                key={p}
                type="button"
                onClick={() => {
                  setHsv(rgbToHsv(hexToRgb(p)));
                  onChange(p);
                }}
                aria-label={`#${p}`}
                title={`#${p}`}
                className={`size-6 rounded-md transition-transform hover:scale-110 cursor-pointer ${
                  active
                    ? "ring-2 ring-[var(--color-border-focus)] ring-offset-2 ring-offset-[var(--color-bg-surface)]"
                    : "border border-[var(--color-border)]"
                }`}
                style={{ backgroundColor: `#${p}` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Live preview                                                               */
/* -------------------------------------------------------------------------- */

function LivePreviewSection({
  colors,
  cornerRadius,
  lightLogo,
  darkLogo,
  mode,
  onModeChange,
}: {
  colors: BrandColors;
  cornerRadius: number;
  lightLogo: string | null;
  darkLogo: string | null;
  mode: "light" | "dark";
  onModeChange: (m: "light" | "dark") => void;
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium tracking-tight text-[var(--color-text-primary)]">
          Live preview
        </h2>
        <ModeToggle mode={mode} onChange={onModeChange} />
      </div>

      <PreviewCanvas
        colors={colors}
        cornerRadius={cornerRadius}
        lightLogo={lightLogo}
        darkLogo={darkLogo}
        mode={mode}
      />

      <p className="text-xs text-center text-[var(--color-text-tertiary)]">
        Preview updates as you change settings above.
      </p>
    </div>
  );
}

function ModeToggle({
  mode,
  onChange,
}: {
  mode: "light" | "dark";
  onChange: (m: "light" | "dark") => void;
}) {
  return (
    <div className="inline-flex items-center p-0.5 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)]">
      {(["light", "dark"] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => onChange(m)}
          className={`px-3 h-6 rounded-md text-xs font-medium transition-colors cursor-pointer capitalize ${
            mode === m
              ? "bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border)]"
              : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
          }`}
        >
          {m}
        </button>
      ))}
    </div>
  );
}

function PreviewCanvas({
  colors,
  cornerRadius,
  lightLogo,
  darkLogo,
  mode,
}: {
  colors: BrandColors;
  cornerRadius: number;
  lightLogo: string | null;
  darkLogo: string | null;
  mode: "light" | "dark";
}) {
  // Auto-adjust the picked colors so they read well in the current preview
  // mode. The user's actual picks stay on the swatch/hex chip; this only
  // shifts the rendered value in the preview when their pick would have
  // poor contrast (e.g. very light primary in light mode).
  const PRIMARY = `#${adjustForMode(colors.primary, "primary", mode)}`;
  const BACKGROUND = `#${adjustForMode(colors.background, "background", mode)}`;
  // Highlight tile derives from primary instead of a separate "surface
  // tint" pick — a low-alpha primary tint that reads on either canvas.
  const PRIMARY_TINT = `${PRIMARY}29`; // ~16% alpha

  // Per-mode palette used by the mocked customer portal preview. Light mode
  // uses neutral surface + dark text; dark mode uses background-as-canvas
  // with light text.
  const palette =
    mode === "dark"
      ? {
          chrome: BACKGROUND,
          chromeBorder: "rgba(255,255,255,0.06)",
          chromeText: "rgba(255,255,255,0.6)",
          appBg: BACKGROUND,
          sidebarDivider: "rgba(255,255,255,0.06)",
          mutedTile: "rgba(255,255,255,0.06)",
          rowBg: "rgba(255,255,255,0.05)",
          rowBarPrimary: "rgba(255,255,255,0.30)",
          rowBarSecondary: "rgba(255,255,255,0.15)",
          textOnApp: "#ffffff",
          textOnAppMuted: "rgba(255,255,255,0.7)",
          activeLogo: darkLogo,
        }
      : {
          chrome: "#e6e9eb",
          chromeBorder: "#d1d5db",
          chromeText: "#6b7280",
          appBg: "#f8f9fa",
          sidebarDivider: "rgba(0,0,0,0.06)",
          mutedTile: "rgba(0,0,0,0.05)",
          rowBg: "#ffffff",
          rowBarPrimary: "rgba(0,0,0,0.30)",
          rowBarSecondary: "rgba(0,0,0,0.10)",
          textOnApp: "#212123",
          textOnAppMuted: "#6b7280",
          activeLogo: lightLogo,
        };

  const onPrimaryText = readableTextColor(PRIMARY);

  // Derive a small radius scale relative to the picked baseline so the
  // preview elements (cards, rows, pills) all reflect the rounding choice.
  // The preview is at miniature scale, so the values are smaller than what
  // the actual app gets.
  const ratio = cornerRadius / 12;
  const r = {
    md: Math.round(8 * ratio),   // pill / button rounding
    sm: Math.round(6 * ratio),   // tile rounding
    xs: Math.round(4 * ratio),   // row rounding
    pill: 9999,                  // always a pill
  };

  return (
    <div className="rounded-xl overflow-hidden border border-[var(--color-border)]">
      {/* Browser chrome */}
      <div
        className="flex items-center gap-1.5 px-3 py-2 border-b"
        style={{ backgroundColor: palette.chrome, borderBottomColor: palette.chromeBorder }}
      >
        <span className="size-2 rounded-full bg-[#ff5f57]" />
        <span className="size-2 rounded-full bg-[#febc2e]" />
        <span className="size-2 rounded-full bg-[#28c840]" />
        <span
          className="flex-1 text-center text-[11px]"
          style={{ color: palette.chromeText }}
        >
          portal.silvi.com
        </span>
      </div>

      {/* App body */}
      <div className="flex" style={{ backgroundColor: palette.appBg }}>
        {/* Mini sidebar */}
        <div
          className="w-[56px] shrink-0 flex flex-col items-center gap-2 py-3 border-r"
          style={{ borderRightColor: palette.sidebarDivider }}
        >
          {palette.activeLogo ? (
            <img
              src={palette.activeLogo}
              alt="Logo"
              className="size-8 object-contain"
            />
          ) : (
            <span
              className="size-8"
              style={{ backgroundColor: PRIMARY, borderRadius: r.sm }}
            />
          )}
          <span
            className="size-8"
            style={{ backgroundColor: palette.mutedTile, borderRadius: r.sm }}
          />
          <span
            className="size-8"
            style={{ backgroundColor: palette.mutedTile, borderRadius: r.sm }}
          />
        </div>

        {/* Main */}
        <div className="flex-1 p-3 flex flex-col gap-3">
          {/* Header row */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: palette.textOnApp }}>
              Payments
            </span>
            <span
              className="px-3 h-6 text-[11px] font-semibold flex items-center"
              style={{
                backgroundColor: PRIMARY,
                color: onPrimaryText,
                borderRadius: r.md,
              }}
            >
              Pay invoice
            </span>
          </div>

          {/* Summary cards — highlight tile uses a low-alpha primary tint. */}
          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Outstanding", value: "$23.4K", highlight: true },
              { label: "Overdue", value: "$4.3K" },
              { label: "Due soon", value: "$14.2K" },
            ].map((s) => (
              <div
                key={s.label}
                className="p-2 flex flex-col gap-1"
                style={{
                  backgroundColor: s.highlight ? PRIMARY_TINT : palette.mutedTile,
                  color: palette.textOnApp,
                  borderRadius: r.sm,
                }}
              >
                <span className="text-[10px] opacity-70">{s.label}</span>
                <span className="text-sm font-semibold">{s.value}</span>
              </div>
            ))}
          </div>

          {/* Mini rows */}
          <div className="flex flex-col gap-1">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-2 py-2"
                style={{ backgroundColor: palette.rowBg, borderRadius: r.xs }}
              >
                <span
                  className="size-4"
                  style={{ backgroundColor: PRIMARY, borderRadius: Math.round(r.xs / 2) }}
                />
                <div className="flex-1 flex flex-col gap-1">
                  <span
                    className="block h-1 w-[80px] rounded-full"
                    style={{ backgroundColor: palette.rowBarPrimary }}
                  />
                  <span
                    className="block h-1 w-[120px] rounded-full"
                    style={{ backgroundColor: palette.rowBarSecondary }}
                  />
                </div>
                <span
                  className="px-2 h-4 text-[9px] font-medium flex items-center"
                  style={{
                    backgroundColor: PRIMARY,
                    color: onPrimaryText,
                    borderRadius: r.pill,
                  }}
                >
                  Due soon
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pick black or white text based on the brightness of a hex bg, so the
 *  preview labels stay readable when the user picks unusual colors. */
function readableTextColor(hex: string): string {
  const cleaned = hex.replace("#", "");
  if (cleaned.length !== 6) return "#000000";
  const r = parseInt(cleaned.slice(0, 2), 16);
  const g = parseInt(cleaned.slice(2, 4), 16);
  const b = parseInt(cleaned.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.6 ? "#0d1e28" : "#ffffff";
}

/* Auto-adjust the picked colors for the preview mode. We clamp HSL.l into
 * a per-role / per-mode range so extreme picks still render with usable
 * contrast. The user's original pick stays in state; this only affects
 * what the preview canvas paints. Per-role lightness ranges below are
 * `[min, max]` for the role in the given mode — values outside the range
 * are clamped in. */
const MODE_RANGES: Record<keyof BrandColors, { light: [number, number]; dark: [number, number] }> = {
  // Primary needs decent contrast against the canvas bg in either mode.
  primary: { light: [0.4, 0.6], dark: [0.5, 0.72] },
  // Background powers the dark canvas surface — keep it dark in dark mode,
  // allow it to lighten a bit in light mode where it shows up as text/icons.
  background: { light: [0.2, 0.5], dark: [0.06, 0.22] },
};

function adjustForMode(
  hex: string,
  role: keyof BrandColors,
  mode: "light" | "dark",
): string {
  const { h, s, l } = hexToHsl(hex);
  const [min, max] = MODE_RANGES[role][mode];
  const clampedL = Math.max(min, Math.min(max, l));
  if (clampedL === l) return hex;
  return hslToHex({ h, s, l: clampedL });
}
