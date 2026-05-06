import { createContext, useContext, useState, useEffect, type ReactNode } from "react";

export type ThemeMode = "auto" | "light" | "dark";
type ResolvedTheme = "dark" | "light";
export type Brand = "skyos" | "fractal" | "outpave";

const BRAND_ORDER: Brand[] = ["skyos", "fractal", "outpave"];
export const BRAND_LABELS: Record<Brand, string> = {
  skyos: "SkyOS",
  fractal: "Fractal",
  outpave: "Outpave",
};

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
}

const ThemeContext = createContext<ThemeContextValue>({
  themeMode: "auto",
  setThemeMode: () => {},
  theme: "dark",
  toggleTheme: () => {},
  brand: "outpave",
  setBrand: () => {},
  cycleBrand: () => {},
});

function getSystemTheme(): ResolvedTheme {
  if (typeof window === "undefined") return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [themeMode, setThemeMode] = useState<ThemeMode>("dark");
  const [systemTheme, setSystemTheme] = useState<ResolvedTheme>(getSystemTheme);
  const [brand, setBrand] = useState<Brand>("outpave");

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
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
