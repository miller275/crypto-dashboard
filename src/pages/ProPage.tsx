import { AppHeader } from "@/components/AppHeader";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

const ProPage = () => {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <section>
          <h1 className="text-2xl font-semibold">{t("pro.plan.title")}</h1>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            {[
              {
                name: t("pro.plan.starter"),
                price: t("pro.plan.price1"),
                features: [t("pro.plan.feature1"), t("pro.plan.feature2"), t("pro.plan.feature3")],
              },
              {
                name: t("pro.plan.growth"),
                price: t("pro.plan.price2"),
                features: [t("pro.plan.feature4"), t("pro.plan.feature5"), t("pro.plan.feature6")],
              },
              {
                name: t("pro.plan.enterprise"),
                price: t("pro.plan.price3"),
                features: [t("pro.plan.feature7"), t("pro.plan.feature8"), t("pro.plan.feature9")],
              },
            ].map((plan) => (
              <div key={plan.name} className="rounded-2xl border border-border p-6">
                <h3 className="text-lg font-semibold">{plan.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{plan.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                  {plan.features.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <button className="mt-6 w-full rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
                  {t("pro.plan.cta")}
                </button>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold">{t("pro.settings")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>{t("pro.settings.company")}</span>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                value={user?.company ?? ""}
                onChange={(event) => updateProfile({ company: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>{t("pro.settings.phone")}</span>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                value={user?.phone ?? ""}
                onChange={(event) => updateProfile({ phone: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>{t("pro.settings.margin")}</span>
              <input
                type="number"
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                value={user?.margin ?? 0}
                onChange={(event) => updateProfile({ margin: Number(event.target.value) })}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>{t("pro.settings.discount")}</span>
              <input
                type="number"
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                value={user?.discount ?? 0}
                onChange={(event) => updateProfile({ discount: Number(event.target.value) })}
              />
            </label>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[t("pro.feature1"), t("pro.feature2"), t("pro.feature3")].map((item) => (
              <div key={item} className="rounded-xl border border-border p-4 text-sm">
                {item}
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ProPage;
