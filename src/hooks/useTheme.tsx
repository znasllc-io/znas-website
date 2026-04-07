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

export type AccentColor = "blue" | "gold" | "emerald" | "silver" | "copper";

export const ACCENT_COLORS: {
  id: AccentColor;
  label: string;
  swatch: string;
  dark: { accent: string; glow: string; hover: string };
  light: { accent: string; glow: string; hover: string };
}[] = [
  {
    id: "blue",
    label: "Electric",
    swatch: "#4F9CF7",
    dark: { accent: "#4F9CF7", glow: "#4F9CF720", hover: "#6BB0FF" },
    light: { accent: "#2E7BD6", glow: "#2E7BD620", hover: "#1A65BE" },
  },
  {
    id: "gold",
    label: "Amber",
    swatch: "#D4A853",
    dark: { accent: "#D4A853", glow: "#D4A85320", hover: "#E0BC6A" },
    light: { accent: "#B8902F", glow: "#B8902F20", hover: "#9A7820" },
  },
  {
    id: "emerald",
    label: "Emerald",
    swatch: "#34D399",
    dark: { accent: "#34D399", glow: "#34D39920", hover: "#5EEAD4" },
    light: { accent: "#059669", glow: "#05966920", hover: "#047857" },
  },
  {
    id: "silver",
    label: "Silver",
    swatch: "#C8CCD4",
    dark: { accent: "#C8CCD4", glow: "#C8CCD420", hover: "#E2E5EA" },
    light: { accent: "#64748B", glow: "#64748B20", hover: "#475569" },
  },
  {
    id: "copper",
    label: "Copper",
    swatch: "#D97B4A",
    dark: { accent: "#D97B4A", glow: "#D97B4A20", hover: "#E8956A" },
    light: { accent: "#B85C2F", glow: "#B85C2F20", hover: "#9A4A22" },
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
  root.style.setProperty("--color-accent", palette.accent);
  root.style.setProperty("--color-accent-glow", palette.glow);
  root.style.setProperty("--color-accent-hover", palette.hover);
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
