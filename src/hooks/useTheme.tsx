"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

export type ThemeMode = "system" | "light" | "dark" | "blackout";
type ResolvedTheme = "light" | "dark" | "blackout";

export type AccentColor = "blue" | "gold" | "emerald" | "silver" | "copper" | "crimson" | "violet" | "cyan" | "rose";

interface FullPalette {
  accent: string;
  glow: string;
  hover: string;
  bgVoid: string;
  bgPrimary: string;
  bgElevated: string;
  bgSurface: string;
  textSecondary: string;
  textTertiary: string;
  textGhost: string;
  border: string;
  borderHover: string;
}

export const ACCENT_COLORS: {
  id: AccentColor;
  label: string;
  swatch: string;
  dark: FullPalette;
  light: FullPalette;
}[] = [
  {
    id: "blue",
    label: "Electric",
    swatch: "#4F9CF7",
    dark: {
      accent: "#4F9CF7",
      glow: "#4F9CF720",
      hover: "#6BB0FF",
      bgVoid: "#050508",
      bgPrimary: "#0A0D14",
      bgElevated: "#111621",
      bgSurface: "#1A1F2E",
      textSecondary: "#9CA3B4",
      textTertiary: "#5A6278",
      textGhost: "#2A3040",
      border: "#1E2433",
      borderHover: "#2E3548",
    },
    light: {
      accent: "#2E7BD6",
      glow: "#2E7BD620",
      hover: "#1A65BE",
      bgVoid: "#F5F5F7",
      bgPrimary: "#FAFAFA",
      bgElevated: "#FFFFFF",
      bgSurface: "#EEEEF0",
      textSecondary: "#4A4A52",
      textTertiary: "#7A7A85",
      textGhost: "#C8C8D0",
      border: "#E0E0E5",
      borderHover: "#D0D0D8",
    },
  },
  {
    id: "gold",
    label: "Amber",
    swatch: "#D4A853",
    dark: {
      accent: "#D4A853",
      glow: "#D4A85320",
      hover: "#E0BC6A",
      bgVoid: "#08060A",
      bgPrimary: "#100C08",
      bgElevated: "#1A1510",
      bgSurface: "#2A2218",
      textSecondary: "#B4A893",
      textTertiary: "#78685A",
      textGhost: "#3A3028",
      border: "#2E2518",
      borderHover: "#453828",
    },
    light: {
      accent: "#B8902F",
      glow: "#B8902F20",
      hover: "#9A7820",
      bgVoid: "#FAF7F2",
      bgPrimary: "#FDFBF7",
      bgElevated: "#FFFFFF",
      bgSurface: "#F0EBE2",
      textSecondary: "#5A5040",
      textTertiary: "#8A7D68",
      textGhost: "#D8D0C0",
      border: "#E8E0D0",
      borderHover: "#D8CDB8",
    },
  },
  {
    id: "emerald",
    label: "Emerald",
    swatch: "#34D399",
    dark: {
      accent: "#34D399",
      glow: "#34D39920",
      hover: "#5EEAD4",
      bgVoid: "#040808",
      bgPrimary: "#081210",
      bgElevated: "#0E1A18",
      bgSurface: "#162824",
      textSecondary: "#8CB4A8",
      textTertiary: "#4A7868",
      textGhost: "#1E3830",
      border: "#1A2E28",
      borderHover: "#28443C",
    },
    light: {
      accent: "#059669",
      glow: "#05966920",
      hover: "#047857",
      bgVoid: "#F2FAF7",
      bgPrimary: "#F7FDFA",
      bgElevated: "#FFFFFF",
      bgSurface: "#E5F0EB",
      textSecondary: "#3A5A4A",
      textTertiary: "#688A78",
      textGhost: "#C0D8CC",
      border: "#D0E5DA",
      borderHover: "#B8D5C5",
    },
  },
  {
    id: "silver",
    label: "Silver",
    swatch: "#C8CCD4",
    dark: {
      accent: "#C8CCD4",
      glow: "#C8CCD420",
      hover: "#E2E5EA",
      bgVoid: "#070708",
      bgPrimary: "#0E0E10",
      bgElevated: "#161618",
      bgSurface: "#1E1E22",
      textSecondary: "#A0A0A8",
      textTertiary: "#606068",
      textGhost: "#2C2C32",
      border: "#222228",
      borderHover: "#32323A",
    },
    light: {
      accent: "#64748B",
      glow: "#64748B20",
      hover: "#475569",
      bgVoid: "#F7F7F8",
      bgPrimary: "#FBFBFC",
      bgElevated: "#FFFFFF",
      bgSurface: "#EDEDF0",
      textSecondary: "#4A4A55",
      textTertiary: "#7A7A88",
      textGhost: "#CCCCD2",
      border: "#E2E2E8",
      borderHover: "#D2D2DA",
    },
  },
  {
    id: "copper",
    label: "Copper",
    swatch: "#D97B4A",
    dark: {
      accent: "#D97B4A",
      glow: "#D97B4A20",
      hover: "#E8956A",
      bgVoid: "#0A0605",
      bgPrimary: "#120C08",
      bgElevated: "#1C1410",
      bgSurface: "#2C2018",
      textSecondary: "#B49880",
      textTertiary: "#786050",
      textGhost: "#3A2C22",
      border: "#302218",
      borderHover: "#483828",
    },
    light: {
      accent: "#B85C2F",
      glow: "#B85C2F20",
      hover: "#9A4A22",
      bgVoid: "#FBF7F4",
      bgPrimary: "#FDFAF7",
      bgElevated: "#FFFFFF",
      bgSurface: "#F2EBE5",
      textSecondary: "#5A4838",
      textTertiary: "#8A7060",
      textGhost: "#D8CCC0",
      border: "#EAE0D5",
      borderHover: "#DAC8B8",
    },
  },
  {
    id: "crimson",
    label: "Crimson",
    swatch: "#DC4B5C",
    dark: {
      accent: "#DC4B5C",
      glow: "#DC4B5C20",
      hover: "#E8707E",
      bgVoid: "#0A0406",
      bgPrimary: "#120810",
      bgElevated: "#1C1018",
      bgSurface: "#2C1822",
      textSecondary: "#B4909A",
      textTertiary: "#785060",
      textGhost: "#3A2028",
      border: "#301820",
      borderHover: "#482830",
    },
    light: {
      accent: "#B83A4A",
      glow: "#B83A4A20",
      hover: "#9A2838",
      bgVoid: "#FBF4F5",
      bgPrimary: "#FDF7F8",
      bgElevated: "#FFFFFF",
      bgSurface: "#F2E8EA",
      textSecondary: "#5A3840",
      textTertiary: "#8A5868",
      textGhost: "#D8C0C5",
      border: "#EAD5D8",
      borderHover: "#DAC0C5",
    },
  },
  {
    id: "violet",
    label: "Violet",
    swatch: "#A78BFA",
    dark: {
      accent: "#A78BFA",
      glow: "#A78BFA20",
      hover: "#C4B5FD",
      bgVoid: "#06050A",
      bgPrimary: "#0C0A14",
      bgElevated: "#14101E",
      bgSurface: "#1E182C",
      textSecondary: "#A098B8",
      textTertiary: "#605878",
      textGhost: "#2C2838",
      border: "#221E30",
      borderHover: "#342E48",
    },
    light: {
      accent: "#7C5CBF",
      glow: "#7C5CBF20",
      hover: "#6644A8",
      bgVoid: "#F7F5FB",
      bgPrimary: "#FAF8FD",
      bgElevated: "#FFFFFF",
      bgSurface: "#EEEBF5",
      textSecondary: "#4A4058",
      textTertiary: "#7A6A90",
      textGhost: "#CCC5D8",
      border: "#E0D8EC",
      borderHover: "#D0C5E0",
    },
  },
  {
    id: "cyan",
    label: "Cyan",
    swatch: "#22D3EE",
    dark: {
      accent: "#22D3EE",
      glow: "#22D3EE20",
      hover: "#67E8F9",
      bgVoid: "#040808",
      bgPrimary: "#06100F",
      bgElevated: "#0C1A1A",
      bgSurface: "#142626",
      textSecondary: "#88B8B8",
      textTertiary: "#487878",
      textGhost: "#1C3636",
      border: "#182C2C",
      borderHover: "#264242",
    },
    light: {
      accent: "#0891B2",
      glow: "#0891B220",
      hover: "#0E7490",
      bgVoid: "#F2FAFB",
      bgPrimary: "#F7FDFD",
      bgElevated: "#FFFFFF",
      bgSurface: "#E5F2F2",
      textSecondary: "#38585A",
      textTertiary: "#608888",
      textGhost: "#C0D8D8",
      border: "#D0E8E8",
      borderHover: "#B8D8DA",
    },
  },
  {
    id: "rose",
    label: "Rose",
    swatch: "#F472B6",
    dark: {
      accent: "#F472B6",
      glow: "#F472B620",
      hover: "#F9A8D4",
      bgVoid: "#0A0408",
      bgPrimary: "#120810",
      bgElevated: "#1C0E18",
      bgSurface: "#2C1624",
      textSecondary: "#B890A4",
      textTertiary: "#785068",
      textGhost: "#3A202E",
      border: "#301825",
      borderHover: "#482838",
    },
    light: {
      accent: "#DB2777",
      glow: "#DB277720",
      hover: "#BE185D",
      bgVoid: "#FDF4F8",
      bgPrimary: "#FEF7FA",
      bgElevated: "#FFFFFF",
      bgSurface: "#F5E8EE",
      textSecondary: "#5A3848",
      textTertiary: "#8A5870",
      textGhost: "#D8C0CC",
      border: "#ECD5DE",
      borderHover: "#DEC0CC",
    },
  },
];

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  accent: AccentColor;
  setMode: (mode: ThemeMode) => void;
  setAccent: (accent: AccentColor) => void;
  cycle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  resolved: "light",
  accent: "blue",
  setMode: () => {},
  setAccent: () => {},
  cycle: () => {},
});

const CYCLE: ThemeMode[] = ["system", "dark", "light"];
const STORAGE_KEY = "znas-theme";
const ACCENT_KEY = "znas-accent";

function getSystemPreference(): "light" | "dark" {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function resolve(mode: ThemeMode): ResolvedTheme {
  if (mode === "system") return getSystemPreference();
  return mode;
}

function applyAccent(accentId: AccentColor, resolvedTheme: ResolvedTheme) {
  const config = ACCENT_COLORS.find((a) => a.id === accentId) ?? ACCENT_COLORS[0];
  const palette = resolvedTheme === "light" ? config.light : config.dark;
  const root = document.documentElement;

  // Accent colors
  root.style.setProperty("--color-accent", palette.accent);
  root.style.setProperty("--color-accent-glow", palette.glow);
  root.style.setProperty("--color-accent-hover", palette.hover);

  // Background colors
  root.style.setProperty("--color-bg-void", palette.bgVoid);
  root.style.setProperty("--color-bg-primary", palette.bgPrimary);
  root.style.setProperty("--color-bg-elevated", palette.bgElevated);
  root.style.setProperty("--color-bg-surface", palette.bgSurface);

  // Text colors (secondary/tertiary — primary stays white/black)
  root.style.setProperty("--color-text-secondary", palette.textSecondary);
  root.style.setProperty("--color-text-tertiary", palette.textTertiary);
  root.style.setProperty("--color-text-ghost", palette.textGhost);

  // Border colors
  root.style.setProperty("--color-border", palette.border);
  root.style.setProperty("--color-border-hover", palette.borderHover);
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");
  const [accent, setAccentState] = useState<AccentColor>("blue");

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    const storedAccent = localStorage.getItem(ACCENT_KEY) as AccentColor | null;

    const m = stored && CYCLE.includes(stored) ? stored : "system";
    const a = storedAccent && ACCENT_COLORS.some((c) => c.id === storedAccent)
      ? storedAccent
      : "blue";

    setModeState(m);
    setAccentState(a);
    const r = resolve(m);
    setResolved(r);
    document.documentElement.setAttribute("data-theme", r);
    applyAccent(a, r);
  }, []);

  // Listen for OS preference changes when in system mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (mode === "system") {
        const r = resolve("system");
        setResolved(r);
        document.documentElement.setAttribute("data-theme", r);
        applyAccent(accent, r);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, accent]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
    const r = resolve(m);
    setResolved(r);
    document.documentElement.setAttribute("data-theme", r);
    applyAccent(accent, r);
  }, [accent]);

  const setAccent = useCallback((a: AccentColor) => {
    setAccentState(a);
    localStorage.setItem(ACCENT_KEY, a);
    applyAccent(a, resolved);
  }, [resolved]);

  const cycle = useCallback(() => {
    setModeState((prev) => {
      const idx = CYCLE.indexOf(prev);
      const next = CYCLE[(idx + 1) % CYCLE.length];
      localStorage.setItem(STORAGE_KEY, next);
      const r = resolve(next);
      setResolved(r);
      document.documentElement.setAttribute("data-theme", r);
      applyAccent(accent, r);
      return next;
    });
  }, [accent]);

  return (
    <ThemeContext.Provider value={{ mode, resolved, accent, setAccent, setMode, cycle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
