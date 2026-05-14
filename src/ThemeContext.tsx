import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { shiftLightness } from "./lib/color";

export type ThemeMode = "auto" | "light" | "dark";
type ResolvedTheme = "dark" | "light";
export type Brand = "skyos" | "fractal" | "outpave" | "white-label";

const BRAND_ORDER: Brand[] = ["skyos", "fractal", "outpave", "white-label"];
export const BRAND_LABELS: Record<Brand, string> = {
  skyos: "SkyOS",
  fractal: "Fractal",
  outpave: "Outpave",
  "white-label": "White Label",
};

/**
 * The runtime override bundle for the white-label brand. FractalSettingsPage
 * lets the user edit these and call `setWhiteLabelTheme` to apply them
 * across the app:
 *   - Color tokens are written to a `<style>` tag scoped to
 *     `[data-brand="white-label"]` and override `index.css`.
 *   - Logos (data URLs) are read by `BrandLogo` so the sidebar / login /
 *     merchant pages render the uploaded mark instead of the seeded Silvi.
 *   - `cornerRadius` (md baseline, in px) scales the whole `--radius-*`
 *     scale proportionally — Square (0), Small (8), Medium (16), Round (28).
 *
 * Colors are 6-char hex, no leading `#`. Logos are full data URLs (or null
 * to fall back to the seeded mark). The whole bundle persists in
 * localStorage so saves survive a page refresh.
 */
export interface WhiteLabelTheme {
  primary: string;
  background: string;
  cornerRadius: number;
  lightLogo: string | null;
  darkLogo: string | null;
  favicon: string | null;
}

/** The four corner-radius presets surfaced in FractalSettings. The number
 *  is the px value used for `--radius-md`; the rest of the scale is derived
 *  proportionally in `buildWhiteLabelOverridesCss`. */
export const CORNER_RADIUS_OPTIONS = [
  { id: "square", label: "Square", value: 0 },
  { id: "small", label: "Small", value: 8 },
  { id: "medium", label: "Medium", value: 16 },
  { id: "round", label: "Round", value: 28 },
] as const;

const WHITE_LABEL_STORAGE_KEY = "sfo:white-label-theme";
const WHITE_LABEL_STYLE_ID = "white-label-overrides";

interface ThemeContextValue {
  /** User-selected mode: auto follows the OS preference. */
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  /** Currently applied theme — "dark" or "light", with "auto" resolved. */
  theme: ResolvedTheme;
  toggleTheme: () => void;
  brand: Brand;
  setBrand: (b: Brand) => void;
  cycleBrand: () => void;
  /** Active runtime overrides for the white-label brand, or null if the
   *  brand is using the values baked into `index.css`. */
  whiteLabelTheme: WhiteLabelTheme | null;
  /** Apply (or clear, with `null`) the white-label overrides app-wide. */
  setWhiteLabelTheme: (theme: WhiteLabelTheme | null) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: "auto",
  setThemeMode: () => {},
  theme: "dark",
  toggleTheme: () => {},
  brand: "outpave",
  setBrand: () => {},
  cycleBrand: () => {},
  whiteLabelTheme: null,
  setWhiteLabelTheme: () => {},
});

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function loadStoredWhiteLabelTheme(): WhiteLabelTheme | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(WHITE_LABEL_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // Migrate older saves: the legacy shape used `accent` (now
    // `background`) and `surfaceTint` (now dropped) and didn't carry a
    // cornerRadius. Coerce/drop fields so the loaded theme always matches
    // the current schema.
    const background =
      typeof parsed?.background === "string"
        ? parsed.background
        : typeof parsed?.accent === "string"
          ? parsed.accent
          : null;
    if (typeof parsed?.primary === "string" && background) {
      return {
        primary: parsed.primary,
        background,
        cornerRadius:
          typeof parsed.cornerRadius === "number" ? parsed.cornerRadius : 12,
        lightLogo: typeof parsed.lightLogo === "string" ? parsed.lightLogo : null,
        darkLogo: typeof parsed.darkLogo === "string" ? parsed.darkLogo : null,
        favicon: typeof parsed.favicon === "string" ? parsed.favicon : null,
      };
    }
  } catch {
    /* corrupt JSON — fall through to null */
  }
  return null;
}

/**
 * Compose a CSS string that overrides the white-label brand tokens. The
 * result is dropped into a `<style>` tag in `<head>` so it sits AFTER the
 * imported tailwind/index.css and wins on cascade order.
 *
 * Mapping:
 *   - `primary` drives all `--color-brand-*`, plus border-brand/focus.
 *   - `background` drives the dark-mode canvas surfaces
 *     (page/surface/elevated/border).
 *   - `cornerRadius` (px, the md baseline) scales the whole `--radius-*`
 *     scale proportionally so the four discrete options feel consistent
 *     across small chips, mid-size cards, and large modals.
 *
 * The legacy `--color-bg-brand-subtle` mapping was dropped — until a
 * dedicated secondary color lands, brand-tinted backgrounds derive from
 * the existing `--color-brand-*` opacity ramp instead.
 */
function buildWhiteLabelOverridesCss(theme: WhiteLabelTheme): string {
  const primary = `#${theme.primary}`;
  const background = `#${theme.background}`;

  // Derived primary variants. Border-brand sits a shade lighter than
  // primary so it reads on hover/focus rings without being the same
  // swatch.
  const brandHover = `#${shiftLightness(primary, -0.1)}`;
  const brand300 = `#${shiftLightness(primary, 0.15)}`;
  const borderBrand = `#${shiftLightness(primary, 0.05)}`;

  // Derived background variants for the dark-mode canvas. Page is slightly
  // darker than background, surface = background, elevated/border step
  // lighter.
  const bgPage = `#${shiftLightness(background, -0.04)}`;
  const bgSurface = background;
  const bgElevated = `#${shiftLightness(background, 0.04)}`;
  const border = `#${shiftLightness(background, 0.08)}`;

  // Derived radius scale. md is the picked value; the rest scale relative
  // to the original index.css scale (md = 12). Square (0) collapses
  // everything to 0; the others round to the nearest pixel for clean
  // values at the larger sizes.
  const r = scaleRadii(theme.cornerRadius);

  return `
[data-brand="white-label"] {
  --color-brand: ${primary};
  --color-brand-hover: ${brandHover};
  --color-brand-300: ${brand300};
  --color-brand-50: ${primary}80;
  --color-brand-20: ${primary}33;
  --color-brand-12: ${primary}1f;
  --color-brand-8: ${primary}14;
  --color-border-brand: ${borderBrand};
  --color-border-focus: ${borderBrand};
  --radius-xs: ${r.xs}px;
  --radius-sm: ${r.sm}px;
  --radius-md: ${r.md}px;
  --radius-lg: ${r.lg}px;
  --radius-xl: ${r.xl}px;
  --radius-2xl: ${r["2xl"]}px;
}
[data-brand="white-label"]:not([data-theme="light"]) {
  --color-bg-page: ${bgPage};
  --color-bg-surface: ${bgSurface};
  --color-bg-elevated: ${bgElevated};
  --color-border: ${border};
}
`.trim();
}

/** Scale the whole `--radius-*` scale proportionally to the picked md
 *  baseline. md=12 in the original scale, so e.g. picking 28 multiplies
 *  every radius by 28/12. */
function scaleRadii(md: number) {
  if (md === 0) return { xs: 0, sm: 0, md: 0, lg: 0, xl: 0, "2xl": 0 };
  const ratio = md / 12;
  return {
    xs: Math.round(4 * ratio),
    sm: Math.round(8 * ratio),
    md,
    lg: Math.round(16 * ratio),
    xl: Math.round(20 * ratio),
    "2xl": Math.round(28 * ratio),
  };
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const [brand, setBrand] = useState<Brand>("outpave");
  const [whiteLabelTheme, setWhiteLabelThemeState] =
    useState<WhiteLabelTheme | null>(loadStoredWhiteLabelTheme);

  // Track OS-level light/dark changes so "auto" stays in sync.
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = (e: MediaQueryListEvent) => {
      setSystemTheme(e.matches ? "dark" : "light");
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const theme: ResolvedTheme =
    themeMode === "auto" ? systemTheme : themeMode;

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    document.documentElement.setAttribute("data-brand", brand);
  }, [theme, brand]);

  // Inject (or remove) the white-label override `<style>` tag whenever the
  // saved theme changes. The tag sits in <head> and overrides the values
  // declared in index.css for the white-label brand only.
  useEffect(() => {
    if (typeof document === "undefined") return;
    let tag = document.getElementById(WHITE_LABEL_STYLE_ID) as HTMLStyleElement | null;
    if (!whiteLabelTheme) {
      if (tag) tag.remove();
      return;
    }
    if (!tag) {
      tag = document.createElement("style");
      tag.id = WHITE_LABEL_STYLE_ID;
      document.head.appendChild(tag);
    }
    tag.textContent = buildWhiteLabelOverridesCss(whiteLabelTheme);
  }, [whiteLabelTheme]);

  const setWhiteLabelTheme = (next: WhiteLabelTheme | null) => {
    setWhiteLabelThemeState(next);
    if (typeof window === "undefined") return;
    try {
      if (next) {
        window.localStorage.setItem(
          WHITE_LABEL_STORAGE_KEY,
          JSON.stringify(next),
        );
      } else {
        window.localStorage.removeItem(WHITE_LABEL_STORAGE_KEY);
      }
    } catch {
      /* localStorage unavailable (Safari private mode) — non-fatal */
    }
  };

  const toggleTheme = () => {
    setThemeMode((prev) => {
      // Toggle exits auto into the opposite of the currently-resolved theme.
      const current: ResolvedTheme = prev === "auto" ? systemTheme : prev;
      return current === "dark" ? "light" : "dark";
    });
  };

  const cycleBrand = () => {
    setBrand((prev) => {
      const idx = BRAND_ORDER.indexOf(prev);
      return BRAND_ORDER[(idx + 1) % BRAND_ORDER.length];
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        setThemeMode,
        theme,
        toggleTheme,
        brand,
        setBrand,
        cycleBrand,
        whiteLabelTheme,
        setWhiteLabelTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
