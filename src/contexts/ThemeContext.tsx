import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { ThemePreference } from "@/lib/types";

interface ThemeContextValue {
  theme: ThemePreference;
  resolvedTheme: "light" | "dark";
  setTheme: (value: ThemePreference) => void;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

const getSystemTheme = (): "light" | "dark" => {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
};

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = useState<ThemePreference>(() => {
    const stored = localStorage.getItem("themePreference");
    if (stored === "light" || stored === "dark" || stored === "system") {
      return stored;
    }
    return "system";
  });
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">(() => getSystemTheme());

  useEffect(() => {
    const handleChange = () => {
      const systemTheme = getSystemTheme();
      setResolvedTheme(theme === "system" ? systemTheme : theme);
    };
    handleChange();
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    media.addEventListener("change", handleChange);
    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("light", resolvedTheme === "light");
    localStorage.setItem("themePreference", theme);
  }, [theme, resolvedTheme]);

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
