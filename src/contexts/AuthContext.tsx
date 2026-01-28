import React, { createContext, useContext, useMemo, useState } from "react";
import type { Role, UserProfile } from "@/lib/types";
import { defaultUserProfile } from "@/data/renovData";

interface AuthContextValue {
  user: UserProfile | null;
  signIn: (role?: Role) => void;
  signOut: () => void;
  updateProfile: (partial: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const loadUser = (): UserProfile | null => {
  const stored = localStorage.getItem("userProfile");
  if (!stored) return null;
  try {
    return JSON.parse(stored) as UserProfile;
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => loadUser());

  const persist = (profile: UserProfile | null) => {
    if (!profile) {
      localStorage.removeItem("userProfile");
      return;
    }
    localStorage.setItem("userProfile", JSON.stringify(profile));
  };

  const signIn = (role: Role = "user") => {
    const storedTheme = localStorage.getItem("themePreference");
    const storedLanguage = localStorage.getItem("language");
    const storedCurrency = localStorage.getItem("currency");
    const profile = {
      ...defaultUserProfile,
      role,
      theme: storedTheme === "light" || storedTheme === "dark" || storedTheme === "system" ? storedTheme : defaultUserProfile.theme,
      language: storedLanguage === "ru" || storedLanguage === "en" || storedLanguage === "ro" ? storedLanguage : defaultUserProfile.language,
      currency: storedCurrency === "EUR" || storedCurrency === "USD" || storedCurrency === "MDL" || storedCurrency === "RON" ? storedCurrency : defaultUserProfile.currency,
    };
    setUser(profile);
    persist(profile);
  };

  const signOut = () => {
    setUser(null);
    persist(null);
  };

  const updateProfile = (partial: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, ...partial };
      persist(updated);
      return updated;
    });
  };

  const value = useMemo(() => ({ user, signIn, signOut, updateProfile }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
};
