import { AppHeader } from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { getEstimates, getLeads, removeEstimate, upsertEstimate } from "@/lib/storage";
import { useCurrency } from "@/contexts/CurrencyContext";
import { buildEstimateResult } from "@/lib/estimate";

const DashboardPage = () => {
  const { t } = useLanguage();
  const { user, updateProfile } = useAuth();
  const { format } = useCurrency();
  const estimates = getEstimates();
  const leads = getLeads().filter((lead) => (user?.role === "pro" ? lead.ownerUserId === user.id : true));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <h1 className="text-2xl font-semibold">{t("dashboard.title")}</h1>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold">{t("dashboard.estimates")}</h2>
          {estimates.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("dashboard.noEstimates")}</p>
          ) : (
            <div className="mt-4 space-y-3">
              {estimates.map((estimate) => {
                const result = buildEstimateResult(estimate);
                return (
                  <div
                    key={estimate.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border p-4"
                  >
                    <div>
                      <h3 className="text-sm font-semibold">
                        {estimate.object.city} · {estimate.object.area} {t("unit.squareMeter")}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {t(`status.${estimate.status}`)} · {new Date(estimate.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {format(result.packages[1].totals.total)}
                    </div>
                    <div className="flex gap-2">
                      <a
                        href={`/result/${estimate.id}`}
                        className="rounded-lg border border-border px-3 py-1 text-xs"
                      >
                        {t("cta.edit")}
                      </a>
                      <button
                        className="rounded-lg border border-border px-3 py-1 text-xs"
                        onClick={() => upsertEstimate({ ...estimate, id: `est-${Date.now()}` })}
                      >
                        {t("cta.duplicate")}
                      </button>
                      <button
                        className="rounded-lg border border-border px-3 py-1 text-xs"
                        onClick={() => removeEstimate(estimate.id)}
                      >
                        {t("cta.delete")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold">{t("dashboard.leads")}</h2>
          {leads.length === 0 ? (
            <p className="mt-3 text-sm text-muted-foreground">{t("dashboard.noLeads")}</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-xs uppercase text-muted-foreground">
                    <th className="px-3 py-2">{t("result.lead.name")}</th>
                    <th className="px-3 py-2">{t("result.lead.contact")}</th>
                    <th className="px-3 py-2">{t("result.lead.city")}</th>
                    <th className="px-3 py-2">{t("result.lead.comment")}</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id} className="border-t border-border">
                      <td className="px-3 py-2">{lead.name}</td>
                      <td className="px-3 py-2">{lead.contact}</td>
                      <td className="px-3 py-2">{lead.city}</td>
                      <td className="px-3 py-2">{lead.comment}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold">{t("dashboard.profile")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm">
              <span>{t("profile.name")}</span>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                value={user?.name ?? ""}
                onChange={(event) => updateProfile({ name: event.target.value })}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span>{t("profile.city")}</span>
              <input
                className="w-full rounded-lg border border-border bg-background px-3 py-2"
                value={user?.city ?? ""}
                onChange={(event) => updateProfile({ city: event.target.value })}
              />
            </label>
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;
