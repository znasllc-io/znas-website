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

interface ThemeContextValue {
  mode: ThemeMode;
  resolved: ResolvedTheme;
  setMode: (mode: ThemeMode) => void;
  cycle: () => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  mode: "system",
  resolved: "light",
  setMode: () => {},
  cycle: () => {},
});

const CYCLE: ThemeMode[] = ["system", "dark", "light"];
const STORAGE_KEY = "znas-theme";

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

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>("system");
  const [resolved, setResolved] = useState<ResolvedTheme>("light");

  // Hydrate from localStorage
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ThemeMode | null;
    if (stored && CYCLE.includes(stored)) {
      setModeState(stored);
      const r = resolve(stored);
      setResolved(r);
      document.documentElement.setAttribute("data-theme", r);
    } else {
      const r = resolve("system");
      setResolved(r);
      document.documentElement.setAttribute("data-theme", r);
    }
  }, []);

  // Listen for OS preference changes when in system mode
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => {
      if (mode === "system") {
        const r = resolve("system");
        setResolved(r);
        document.documentElement.setAttribute("data-theme", r);
      }
    };
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode]);

  const setMode = useCallback((m: ThemeMode) => {
    setModeState(m);
    localStorage.setItem(STORAGE_KEY, m);
    const r = resolve(m);
    setResolved(r);
    document.documentElement.setAttribute("data-theme", r);
  }, []);

  const cycle = useCallback(() => {
    setModeState((prev) => {
      const idx = CYCLE.indexOf(prev);
      const next = CYCLE[(idx + 1) % CYCLE.length];
      localStorage.setItem(STORAGE_KEY, next);
      const r = resolve(next);
      setResolved(r);
      document.documentElement.setAttribute("data-theme", r);
      return next;
    });
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, resolved, setMode, cycle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
