import { Link, NavLink } from "react-router-dom";
import { useEffect } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTheme } from "@/contexts/ThemeContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import type { Language, Role, ThemePreference } from "@/lib/types";

const linkBase =
  "text-sm font-medium text-muted-foreground hover:text-foreground transition";

export const AppHeader = () => {
  const { t, language, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useCurrency();
  const { user, signIn, signOut, updateProfile } = useAuth();

  const handleRole = (role: Role) => {
    if (role === "guest") {
      signOut();
      return;
    }
    signIn(role);
  };

  useEffect(() => {
    if (!user) return;
    if (user.theme !== theme) setTheme(user.theme);
    if (user.language !== language) setLanguage(user.language);
    if (user.currency !== currency) setCurrency(user.currency);
  }, [user, theme, language, currency, setTheme, setLanguage, setCurrency]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/40 bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
          <span className="rounded-lg bg-primary px-2 py-1 text-primary-foreground">
            RenovEstimate
          </span>
          <span className="text-sm text-muted-foreground">{t("nav.tagline")}</span>
        </Link>
        <nav className="flex items-center gap-4">
          <NavLink to="/" className={linkBase}>
            {t("nav.home")}
          </NavLink>
          <NavLink to="/calc" className={linkBase}>
            {t("nav.calc")}
          </NavLink>
          <NavLink to="/dashboard" className={linkBase}>
            {t("nav.dashboard")}
          </NavLink>
          <NavLink to="/pro" className={linkBase}>
            {t("nav.pro")}
          </NavLink>
          <NavLink to="/admin" className={linkBase}>
            {t("nav.admin")}
          </NavLink>
        </nav>
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            {t("theme.label")}
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
              value={theme}
              onChange={(event) => {
                const next = event.target.value as ThemePreference;
                setTheme(next);
                if (user) updateProfile({ theme: next });
              }}
            >
              <option value="light">{t("theme.light")}</option>
              <option value="dark">{t("theme.dark")}</option>
              <option value="system">{t("theme.system")}</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            {t("language.label")}
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
              value={language}
              onChange={(event) => {
                const next = event.target.value as Language;
                setLanguage(next);
                if (user) updateProfile({ language: next });
              }}
            >
              <option value="ru">RU</option>
              <option value="en">EN</option>
              <option value="ro">RO</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            {t("currency.label")}
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
              value={currency}
              onChange={(event) => {
                const next = event.target.value as typeof currency;
                setCurrency(next);
                if (user) updateProfile({ currency: next });
              }}
            >
              <option value="EUR">EUR</option>
              <option value="USD">USD</option>
              <option value="MDL">MDL</option>
              <option value="RON">RON</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-xs text-muted-foreground">
            {t("nav.role")}
            <select
              className="rounded-md border border-border bg-background px-2 py-1 text-xs"
              value={user?.role ?? "guest"}
              onChange={(event) => handleRole(event.target.value as Role)}
            >
              {(["guest", "user", "pro", "admin"] as Role[]).map((role) => (
                <option key={role} value={role}>
                  {t(`role.${role}`)}
                </option>
              ))}
            </select>
          </label>
          {user ? (
            <button
              className="rounded-md border border-border px-3 py-1 text-xs"
              onClick={signOut}
            >
              {t("nav.signout")}
            </button>
          ) : (
            <button
              className="rounded-md bg-primary px-3 py-1 text-xs text-primary-foreground"
              onClick={() => signIn("user")}
            >
              {t("nav.signin")}
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
