import { useMemo, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  diagramRules,
  diagramTemplates,
  fxRates,
  materialsCatalog,
  presetEstimates,
  priceCatalog,
  regions,
} from "@/data/renovData";
import type { DiagramElement } from "@/lib/types";
import { exportTemplateJson, renderDiagram } from "@/lib/diagrams";
import { getEstimates, getLeads } from "@/lib/storage";

const aiCacheKey = "ai_template_cache";
const aiRateKey = "ai_rate_limit";

const checkAiRate = () => {
  const now = Date.now();
  const windowMs = 60_000;
  const max = 10;
  const stored = localStorage.getItem(aiRateKey);
  const timestamps = stored ? (JSON.parse(stored) as number[]) : [];
  const recent = timestamps.filter((time) => now - time < windowMs);
  if (recent.length >= max) return false;
  recent.push(now);
  localStorage.setItem(aiRateKey, JSON.stringify(recent));
  return true;
};

const AdminPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [selectedTemplateId, setSelectedTemplateId] = useState(diagramTemplates[0]?.id);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [aiLog, setAiLog] = useState<string | null>(null);

  const template = useMemo(
    () => diagramTemplates.find((item) => item.id === selectedTemplateId) ?? diagramTemplates[0],
    [selectedTemplateId]
  );

  const selectedElement = useMemo(
    () => template?.template.elements.find((item) => item.id === selectedElementId) ?? null,
    [template, selectedElementId]
  );

  const updateElement = (updates: Partial<DiagramElement>) => {
    if (!template || !selectedElement) return;
    selectedElement.x = updates.x ?? selectedElement.x;
    selectedElement.y = updates.y ?? selectedElement.y;
    selectedElement.w = updates.w ?? selectedElement.w;
    selectedElement.h = updates.h ?? selectedElement.h;
    selectedElement.text = updates.text ?? selectedElement.text;
    selectedElement.stroke = updates.stroke ?? selectedElement.stroke;
    selectedElement.fill = updates.fill ?? selectedElement.fill;
    selectedElement.icon = updates.icon ?? selectedElement.icon;
    setSelectedElementId(selectedElement.id);
  };

  const addElement = (type: DiagramElement["type"]) => {
    if (!template) return;
    const element: DiagramElement = {
      id: `el-${Date.now()}`,
      type,
      x: 60,
      y: 60,
      w: 120,
      h: 40,
      textKey: type === "text" ? "admin.newText" : undefined,
      stroke: "#94a3b8",
      fill: type === "rect" ? "#e2e8f0" : "none",
    };
    template.template.elements.push(element);
    setSelectedElementId(element.id);
  };

  const runAiAction = (action: "draft" | "improve" | "variant" | "autobind") => {
    if (!template) return;
    if (!checkAiRate()) {
      setAiLog(t("admin.ai.rate"));
      return;
    }
    const cache = localStorage.getItem(aiCacheKey);
    const map = cache ? (JSON.parse(cache) as Record<string, string>) : {};
    const key = `${action}-${template.id}-${template.version}`;
    if (map[key]) {
      setAiLog(`${t("admin.ai.cached")} ${action}.`);
      return;
    }
    if (action === "draft") {
      template.template.elements = [
        { id: "draft-title", type: "text", x: 40, y: 40, textKey: "admin.ai.draftTitle" },
        { id: "draft-box", type: "rect", x: 40, y: 70, w: 240, h: 120, stroke: "#0ea5e9", fill: "none" },
        { id: "draft-icon", type: "icon", x: 60, y: 90, icon: "manifold" },
      ];
    }
    if (action === "improve") {
      template.template.elements.forEach((el, index) => {
        el.x = 40 + index * 40;
        el.y = 60 + index * 20;
      });
    }
    if (action === "variant") {
      template.template.layers.push({
        id: `variant-${Date.now()}`,
        name: t("admin.variantLayer"),
        visible: true,
      });
    }
    if (action === "autobind") {
      template.template.elements.forEach((el) => {
        if (el.type === "text") {
          el.bindings = { ...el.bindings, textKey: "diagram.radiators.count" };
        }
      });
    }
    map[key] = new Date().toISOString();
    localStorage.setItem(aiCacheKey, JSON.stringify(map));
    setAiLog(`${t("admin.ai.executed")} ${action}.`);
  };

  const estimates = getEstimates();
  const leads = getLeads();

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-10">
        <h1 className="text-2xl font-semibold">{t("admin.title")}</h1>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold">{t("admin.catalogs")}</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {priceCatalog.map((item) => (
                <li key={item.id}>
                  {t(item.nameKey)} · {t(`system.${item.workType}`)} · {t(item.unitKey)}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-muted-foreground">
              {t("admin.catalog.materials")}: {materialsCatalog.length}
            </div>
          </div>
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold">{t("admin.regions")}</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {regions.map((region) => (
                <li key={region.id}>
                  {region.country} · {region.region}: {region.coef}
                </li>
              ))}
            </ul>
            <div className="mt-4 text-xs text-muted-foreground">
              {t("admin.fx")}: {fxRates.map((rate) => `${rate.currency}=${rate.rateToEur}`).join(" · ")}
            </div>
          </div>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold">{t("admin.presets")}</h2>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              {presetEstimates.map((preset) => (
                <li key={preset.id}>{t(preset.nameKey)}</li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border border-border p-6">
            <h2 className="text-lg font-semibold">{t("admin.leads")}</h2>
            <div className="mt-4 text-sm text-muted-foreground">
              {t("admin.stats.estimates")}: {estimates.length} · {t("admin.stats.leads")}: {leads.length}
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold">{t("admin.diagrams")}</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-[220px_1fr]">
            <aside className="space-y-4">
              <div>
                <h3 className="text-sm font-semibold">{t("admin.diagrams.templates")}</h3>
                <select
                  className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                  value={selectedTemplateId}
                  onChange={(event) => {
                    setSelectedTemplateId(event.target.value);
                    setSelectedElementId(null);
                  }}
                >
                  {diagramTemplates.map((item) => (
                    <option key={item.id} value={item.id}>
                      {t(item.nameKey)}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <h3 className="text-sm font-semibold">{t("admin.diagrams.rules")}</h3>
                <ul className="mt-2 space-y-2 text-xs text-muted-foreground">
                  {diagramRules.map((rule) => (
                    <li key={rule.id}>
                      {t(`system.${rule.workType}`)} · {rule.priority} · {t("admin.rules.template")} {rule.action.templateId}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="text-sm font-semibold">{t("admin.diagrams.editor")}</h3>
                <div className="mt-2 space-y-2">
                  {template?.template.elements.map((el) => (
                    <button
                      key={el.id}
                      className={`w-full rounded-md border border-border px-2 py-1 text-left text-xs ${
                        selectedElementId === el.id ? "bg-primary/10 text-primary" : ""
                      }`}
                      onClick={() => setSelectedElementId(el.id)}
                    >
                      {el.type} · {el.id}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {(["rect", "line", "text", "icon"] as DiagramElement["type"][]).map((type) => (
                    <button
                      key={type}
                      className="rounded-md border border-border px-2 py-1 text-xs"
                      onClick={() => addElement(type)}
                    >
                      + {type}
                    </button>
                  ))}
                </div>
              </div>
            </aside>

            <div className="space-y-6">
              <div className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold">{t("admin.canvas.title")}</h3>
                    <p className="text-xs text-muted-foreground">
                      {t("admin.canvas.grid")} {Math.round(zoom * 100)}%
                    </p>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="1.5"
                    step="0.1"
                    value={zoom}
                    onChange={(event) => setZoom(Number(event.target.value))}
                  />
                </div>
                <div
                  className="mt-4 overflow-auto rounded-lg border border-dashed border-border bg-[linear-gradient(#e2e8f0_1px,transparent_1px),linear-gradient(90deg,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] p-4"
                  style={{ transform: `scale(${zoom})`, transformOrigin: "top left" }}
                >
                  {template && (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: renderDiagram(
                          template,
                          {
                          radiators: 6,
                          sockets: 20,
                          lights: 10,
                          cableTotal: 160,
                          linesSockets: 2,
                          linesLights: 1,
                          scheme: "singlePipe",
                          thermoHeads: true,
                          boilerType: "gas",
                          pump: true,
                          expansionTank: true,
                          filters: true,
                          circuitsCount: 4,
                          pipeTotal: 160,
                          waterPoints: 6,
                          sewerPoints: 4,
                          },
                          undefined,
                          t
                        ),
                      }}
                    />
                  )}
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold">{t("admin.properties.title")}</h3>
                  {selectedElement ? (
                    <div className="mt-3 space-y-2 text-xs text-muted-foreground">
                      <label className="flex items-center justify-between gap-2">
                        {t("admin.prop.x")}
                        <input
                          type="number"
                          className="w-24 rounded-md border border-border bg-background px-2 py-1"
                          value={selectedElement.x}
                          onChange={(event) => updateElement({ x: Number(event.target.value) })}
                        />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        {t("admin.prop.y")}
                        <input
                          type="number"
                          className="w-24 rounded-md border border-border bg-background px-2 py-1"
                          value={selectedElement.y}
                          onChange={(event) => updateElement({ y: Number(event.target.value) })}
                        />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        {t("admin.prop.w")}
                        <input
                          type="number"
                          className="w-24 rounded-md border border-border bg-background px-2 py-1"
                          value={selectedElement.w ?? 0}
                          onChange={(event) => updateElement({ w: Number(event.target.value) })}
                        />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        {t("admin.prop.h")}
                        <input
                          type="number"
                          className="w-24 rounded-md border border-border bg-background px-2 py-1"
                          value={selectedElement.h ?? 0}
                          onChange={(event) => updateElement({ h: Number(event.target.value) })}
                        />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        {t("admin.prop.text")}
                        <input
                          className="w-32 rounded-md border border-border bg-background px-2 py-1"
                          value={selectedElement.text ?? ""}
                          onChange={(event) => updateElement({ text: event.target.value })}
                        />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        {t("admin.prop.stroke")}
                        <input
                          className="w-24 rounded-md border border-border bg-background px-2 py-1"
                          value={selectedElement.stroke ?? ""}
                          onChange={(event) => updateElement({ stroke: event.target.value })}
                        />
                      </label>
                      <label className="flex items-center justify-between gap-2">
                        {t("admin.prop.fill")}
                        <input
                          className="w-24 rounded-md border border-border bg-background px-2 py-1"
                          value={selectedElement.fill ?? ""}
                          onChange={(event) => updateElement({ fill: event.target.value })}
                        />
                      </label>
                    </div>
                  ) : (
                    <p className="mt-3 text-xs text-muted-foreground">{t("admin.properties.select")}</p>
                  )}
                </div>
                <div className="rounded-xl border border-border p-4">
                  <h3 className="text-sm font-semibold">{t("cta.aiAssistant")}</h3>
                  <div className="mt-3 grid gap-2">
                    <button
                      className="rounded-md border border-border px-3 py-2 text-xs"
                      onClick={() => runAiAction("draft")}
                    >
                      {t("cta.generateDraft")}
                    </button>
                    <button
                      className="rounded-md border border-border px-3 py-2 text-xs"
                      onClick={() => runAiAction("improve")}
                    >
                      {t("cta.improveLayout")}
                    </button>
                    <button
                      className="rounded-md border border-border px-3 py-2 text-xs"
                      onClick={() => runAiAction("variant")}
                    >
                      {t("cta.addVariant")}
                    </button>
                    <button
                      className="rounded-md border border-border px-3 py-2 text-xs"
                      onClick={() => runAiAction("autobind")}
                    >
                      {t("cta.autoBind")}
                    </button>
                  </div>
                  {aiLog && <p className="mt-3 text-xs text-muted-foreground">{aiLog}</p>}
                </div>
              </div>

              <div className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">{t("admin.templates.json")}</h3>
                  <button className="rounded-md border border-border px-2 py-1 text-xs">
                    {t("cta.exportSvg")}
                  </button>
                </div>
                <pre className="mt-3 max-h-64 overflow-auto rounded-lg bg-muted/20 p-3 text-xs">
                  {template ? exportTemplateJson(template.template) : ""}
                </pre>
              </div>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border p-6">
          <h2 className="text-lg font-semibold">{t("admin.preview.title")}</h2>
          <p className="mt-2 text-sm text-muted-foreground">{t("admin.preview.desc")}</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {estimates.slice(0, 4).map((estimate) => (
              <div key={estimate.id} className="rounded-xl border border-border p-4">
                <h3 className="text-sm font-semibold">{estimate.object.city}</h3>
                <p className="text-xs text-muted-foreground">
                  {estimate.object.area} {t("unit.squareMeter")} · {estimate.object.rooms} {t("admin.rooms.label")}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-4 text-xs text-muted-foreground">
            {t("admin.preview.auth")}: {t(`role.${user?.role ?? "guest"}`)}
          </div>
        </section>
      </main>
    </div>
  );
};

export default AdminPage;
