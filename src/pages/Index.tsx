import { Link } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { presetEstimates } from "@/data/renovData";

const faqItems = Array.from({ length: 12 }).map((_, index) => index + 1);

const Index = () => {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-16 px-6 py-12">
        <section className="rounded-3xl border border-border bg-gradient-to-br from-primary/10 to-transparent p-10 shadow-card">
          <span className="inline-flex items-center rounded-full border border-border px-4 py-1 text-xs uppercase tracking-wide text-muted-foreground">
            {t("hero.badge")}
          </span>
          <h1 className="mt-4 text-3xl font-semibold leading-tight md:text-4xl">
            {t("hero.title")}
          </h1>
          <p className="mt-4 max-w-3xl text-base text-muted-foreground">{t("hero.subtitle")}</p>
          <div className="mt-6 flex flex-wrap gap-4">
            <Link
              to="/calc"
              className="rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              {t("cta.calculate")}
            </Link>
            <Link
              to="/calc"
              className="rounded-lg border border-border px-5 py-3 text-sm font-semibold text-foreground"
            >
              {t("cta.start")}
            </Link>
          </div>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-border bg-background/60 p-4">
              <h3 className="text-sm font-semibold">{t("landing.packages.title")}</h3>
              <p className="text-xs text-muted-foreground">{t("landing.packages.desc")}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-4">
              <h3 className="text-sm font-semibold">{t("landing.method.title")}</h3>
              <p className="text-xs text-muted-foreground">{t("landing.method.desc")}</p>
            </div>
            <div className="rounded-xl border border-border bg-background/60 p-4">
              <h3 className="text-sm font-semibold">{t("landing.pdf.title")}</h3>
              <p className="text-xs text-muted-foreground">{t("landing.pdf.desc")}</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">{t("how.title")}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[1, 2, 3].map((step) => (
              <div key={step} className="rounded-2xl border border-border p-6">
                <span className="text-xs font-semibold text-primary">
                  {t("step.label")} {step}
                </span>
                <p className="mt-3 text-sm text-muted-foreground">
                  {t(`how.step${step}`)}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-2xl font-semibold">{t("demo.title")}</h2>
            <Link to="/calc" className="text-sm text-primary">
              {t("cta.calculate")}
            </Link>
          </div>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {presetEstimates.slice(0, 3).map((preset) => (
              <div key={preset.id} className="rounded-2xl border border-border p-6">
                <h3 className="text-base font-semibold">{t(preset.nameKey)}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{t(preset.descriptionKey)}</p>
                <Link
                  to={`/calc?preset=${preset.id}`}
                  className="mt-4 inline-flex items-center text-sm font-semibold text-primary"
                >
                  {t("cta.preview")}
                </Link>
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">{t("pro.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("pro.subtitle")}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[t("pro.feature1"), t("pro.feature2"), t("pro.feature3")].map((item) => (
              <div key={item} className="rounded-2xl border border-border p-6 text-sm">
                {item}
              </div>
            ))}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">{t("partners.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("partners.subtitle")}</p>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            {[t("partners.item1"), t("partners.item2"), t("partners.item3"), t("partners.item4")].map(
              (item) => (
                <div key={item} className="rounded-2xl border border-border p-6 text-sm">
                  {item}
                </div>
              )
            )}
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold">{t("faq.title")}</h2>
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {faqItems.map((index) => (
              <div key={index} className="rounded-2xl border border-border p-4">
                <h3 className="text-sm font-semibold">{t(`faq.q${index}`)}</h3>
                <p className="mt-2 text-xs text-muted-foreground">{t(`faq.a${index}`)}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default Index;
