import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useAuth } from "@/contexts/AuthContext";
import { buildEstimateResult } from "@/lib/estimate";
import { addLead, getEstimates } from "@/lib/storage";
import { materialsCatalog } from "@/data/renovData";
import { renderDiagram, selectDiagramTemplate } from "@/lib/diagrams";
import type { Lead, WorkType } from "@/lib/types";

const rateLimitKey = "lead_rate_limit";

const canSendLead = () => {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 6;
  const stored = localStorage.getItem(rateLimitKey);
  const timestamps = stored ? (JSON.parse(stored) as number[]) : [];
  const recent = timestamps.filter((time) => now - time < windowMs);
  if (recent.length >= max) return false;
  recent.push(now);
  localStorage.setItem(rateLimitKey, JSON.stringify(recent));
  return true;
};

const ResultPage = () => {
  const { id } = useParams();
  const { t } = useLanguage();
  const { format } = useCurrency();
  const { user } = useAuth();
  const estimates = getEstimates();
  const estimate = useMemo(
    () => estimates.find((item) => item.id === id) ?? estimates[0],
    [id, estimates]
  );

  const result = useMemo(() => buildEstimateResult(estimate), [estimate]);
  const [leadData, setLeadData] = useState({ name: "", contact: "", city: "", comment: "", hp: "" });
  const [leadStatus, setLeadStatus] = useState<string | null>(null);

  const handleLeadSubmit = () => {
    if (leadData.hp) {
      setLeadStatus(t("result.lead.spam"));
      return;
    }
    if (!canSendLead()) {
      setLeadStatus(t("result.lead.rate"));
      return;
    }
    const lead: Lead = {
      id: `lead-${Date.now()}`,
      estimateId: estimate.id,
      name: leadData.name,
      contact: leadData.contact,
      city: leadData.city,
      comment: leadData.comment,
      createdAt: new Date().toISOString(),
      ownerUserId: user?.role === "pro" ? user.id : undefined,
    };
    addLead(lead);
    setLeadStatus(t("result.lead.success"));
    setLeadData({ name: "", contact: "", city: "", comment: "", hp: "" });
  };

  const openPdfWindow = () => {
    const watermark = user ? "" : t("pdf.watermark");
    const content = `
      <html>
        <head>
          <title>${t("pdf.windowTitle")}</title>
          <style>
            body { font-family: Inter, sans-serif; padding: 32px; }
            .watermark { position: fixed; top: 40%; left: 30%; font-size: 72px; color: rgba(200,200,200,0.3); transform: rotate(-20deg); }
            h1,h2 { margin: 0 0 12px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
            td, th { border: 1px solid #ddd; padding: 8px; font-size: 12px; }
          </style>
        </head>
        <body>
          ${watermark ? `<div class="watermark">${watermark}</div>` : ""}
          <h1>${t("pdf.title")}</h1>
          <p>${t("pdf.city")}: ${result.object.city} · ${new Date().toLocaleDateString()}</p>
          <h2>${t("pdf.packages")}</h2>
          <table>
            <thead><tr><th>${t("result.table.package")}</th><th>${t("result.table.labor")}</th><th>${t("result.table.materials")}</th><th>${t("result.table.total")}</th></tr></thead>
            <tbody>
              ${result.packages
                .map(
                  (pkg) => `<tr><td>${pkg.packageName}</td><td>${format(
                    pkg.totals.laborCost
                  )}</td><td>${format(pkg.totals.materialsCost)}</td><td>${format(
                    pkg.totals.total
                  )}</td></tr>`
                )
                .join("")}
            </tbody>
          </table>
          <h2>${t("pdf.works")}</h2>
          <ul>${result.workBreakdown
            .map((item) => `<li>${t(item.labelKey)}: ${item.qty} ${t(item.unitKey)}</li>`)
            .join("")}</ul>
          <h2>${t("pdf.materials")}</h2>
          <ul>${result.materials
            .map((item) => {
              const catalog = materialsCatalog.find((mat) => mat.workType === item.workType);
              const analogs = catalog?.analogKeys.map((key) => t(key)).join(", ") ?? t("misc.na");
              return `<li>${t(item.labelKey)}: ${item.qty} ${t(item.unitKey)} · ${t("result.materials.analogs")}: ${analogs}</li>`;
            })
            .join("")}</ul>
          <h2>${t("pdf.stages")}</h2>
          <ol>${result.stages.map((stage) => `<li>${t(stage)}</li>`).join("")}</ol>
          <h2>${t("pdf.checklist")}</h2>
          <ol>${result.checklist.map((item) => `<li>${t(item)}</li>`).join("")}</ol>
          <h2>${t("pdf.calculated")}</h2>
          <ul>
            <li>${t("how.region")}: ${result.coefficients.regionCoef.toFixed(2)}</li>
            <li>${t("how.urgency")}: ${result.coefficients.urgencyCoef.toFixed(2)}</li>
            <li>${t("how.complexity")}: ${result.coefficients.complexityCoef.toFixed(2)}</li>
            <li>${t("how.range")}: ${result.coefficients.rangeMin.toFixed(2)}–${result.coefficients.rangeMax.toFixed(2)}</li>
          </ul>
        </body>
      </html>`;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(content);
    win.document.close();
    win.focus();
    win.print();
  };

  const diagrams = (["electrical", "radiators", "boiler", "floorHeating", "plumbing"] as WorkType[])
    .filter((type) => {
      switch (type) {
        case "electrical":
          return result.systems.electrical.enabled;
        case "radiators":
          return result.systems.radiators.enabled;
        case "boiler":
          return result.systems.boiler.enabled;
        case "floorHeating":
          return result.systems.floorHeating.enabled;
        case "plumbing":
          return result.systems.plumbing.enabled;
        default:
          return false;
      }
    })
    .map((type) => {
      const { template } = selectDiagramTemplate(type, result.variables);
      return { type, svg: renderDiagram(template, result.variables, undefined, t) };
    });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-10 px-6 py-10">
        <section className="rounded-2xl border border-border p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold">{t("result.title")}</h1>
              <p className="text-sm text-muted-foreground">
                {result.object.city} · {result.object.area} {t("unit.squareMeter")} · {result.object.rooms} {t("result.summary.rooms")}
              </p>
            </div>
            <div className="flex gap-3">
              <button
                className="rounded-lg border border-border px-4 py-2 text-sm"
                onClick={openPdfWindow}
              >
                {t("cta.download")}
              </button>
              <Link
                to="/dashboard"
                className="rounded-lg border border-border px-4 py-2 text-sm"
              >
                {t("cta.save")}
              </Link>
              <button className="rounded-lg bg-primary px-4 py-2 text-sm text-primary-foreground">
                {t("cta.share")}
              </button>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="text-xl font-semibold">{t("result.packages")}</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-2">{t("result.table.package")}</th>
                  <th className="px-4 py-2">{t("result.table.labor")}</th>
                  <th className="px-4 py-2">{t("result.table.materials")}</th>
                  <th className="px-4 py-2">{t("result.table.total")}</th>
                  <th className="px-4 py-2">{t("result.table.range")}</th>
                  <th className="px-4 py-2">{t("result.table.duration")}</th>
                </tr>
              </thead>
              <tbody>
                {result.packages.map((pkg) => (
                  <tr key={pkg.packageName} className="border-t border-border">
                    <td className="px-4 py-3 font-semibold">{t(`result.package.${pkg.packageName}`)}</td>
                    <td className="px-4 py-3">{format(pkg.totals.laborCost)}</td>
                    <td className="px-4 py-3">{format(pkg.totals.materialsCost)}</td>
                    <td className="px-4 py-3">{format(pkg.totals.total)}</td>
                    <td className="px-4 py-3">
                      {format(pkg.totals.min)} – {format(pkg.totals.max)}
                    </td>
                    <td className="px-4 py-3">
                      {pkg.totals.durationDays} {t("result.table.days")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold">{t("result.works")}</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {result.workBreakdown.map((item) => (
              <li key={item.key}>
                {t(item.labelKey)}: {item.qty} {t(item.unitKey)} — {t(item.reasonKey)}
              </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold">{t("result.materials")}</h2>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              {result.materials.map((item) => {
                const catalog = materialsCatalog.find((mat) => mat.workType === item.workType);
                const analogs = catalog?.analogKeys.map((key) => t(key)).join(", ") ?? t("misc.na");
                return (
                  <li key={item.key}>
                    {t(item.labelKey)}: {item.qty} {t(item.unitKey)} · {t(item.reasonKey)}
                    <div className="text-xs text-muted-foreground">
                      {t("result.materials.analogs")}: {analogs}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold">{t("result.stages")}</h2>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            {result.stages.map((item) => (
              <li key={item}>{t(item)}</li>
            ))}
            </ol>
          </div>
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold">{t("result.checklist")}</h2>
            <ol className="mt-3 space-y-2 text-sm text-muted-foreground">
            {result.checklist.map((item) => (
              <li key={item}>{t(item)}</li>
            ))}
            </ol>
          </div>
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold">{t("result.how")}</h2>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              {t("how.region")}: {result.coefficients.regionCoef.toFixed(2)}
            </li>
            <li>
              {t("how.urgency")}: {result.coefficients.urgencyCoef.toFixed(2)}
            </li>
            <li>
              {t("how.complexity")}: {result.coefficients.complexityCoef.toFixed(2)}
            </li>
            <li>
              {t("how.range")}: {result.coefficients.rangeMin.toFixed(2)}–{result.coefficients.rangeMax.toFixed(2)}
            </li>
          </ul>
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold">{t("result.diagrams")}</h2>
          <div className="mt-4 grid gap-6 md:grid-cols-2">
            {diagrams.map((diagram) => (
              <div key={diagram.type} className="rounded-xl border border-border p-4">
                <h3 className="text-sm font-semibold">{t(`system.${diagram.type}`)}</h3>
                <div
                  className="mt-3 overflow-auto rounded-lg bg-muted/20 p-2"
                  dangerouslySetInnerHTML={{ __html: diagram.svg }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold">{t("result.lead.title")}</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder={t("result.lead.name")}
              value={leadData.name}
              onChange={(event) => setLeadData((prev) => ({ ...prev, name: event.target.value }))}
            />
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder={t("result.lead.contact")}
              value={leadData.contact}
              onChange={(event) =>
                setLeadData((prev) => ({ ...prev, contact: event.target.value }))
              }
            />
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder={t("result.lead.city")}
              value={leadData.city}
              onChange={(event) => setLeadData((prev) => ({ ...prev, city: event.target.value }))}
            />
            <input
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
              placeholder={t("result.lead.comment")}
              value={leadData.comment}
              onChange={(event) =>
                setLeadData((prev) => ({ ...prev, comment: event.target.value }))
              }
            />
            <input
              className="hidden"
              value={leadData.hp}
              onChange={(event) => setLeadData((prev) => ({ ...prev, hp: event.target.value }))}
            />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <button
              className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              onClick={handleLeadSubmit}
            >
              {t("cta.send")}
            </button>
            {leadStatus && <span className="text-xs text-muted-foreground">{leadStatus}</span>}
          </div>
        </section>
      </main>
    </div>
  );
};

export default ResultPage;
