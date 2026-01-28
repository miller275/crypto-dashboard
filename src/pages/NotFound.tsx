import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";

const NotFound = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex max-w-4xl flex-col items-center gap-4 px-6 py-24 text-center">
        <h1 className="text-4xl font-semibold">404</h1>
        <p className="text-sm text-muted-foreground">
          {t("notfound.title")} {t("notfound.desc")}
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/" className="rounded-lg border border-border px-4 py-2 text-sm">
            {t("notfound.home")}
          </Link>
          <Link
            to="/calc"
            className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground"
          >
            {t("notfound.calc")}
          </Link>
        </div>
      </main>
    </div>
  );
};

export default NotFound;
