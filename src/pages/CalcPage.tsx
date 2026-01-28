import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { AppHeader } from "@/components/AppHeader";
import { useLanguage } from "@/contexts/LanguageContext";
import { presetEstimates, regions } from "@/data/renovData";
import type { EstimateInput } from "@/lib/types";
import { upsertEstimate } from "@/lib/storage";

const buildDefaultEstimate = (): EstimateInput => ({
  id: `est-${Date.now()}`,
  createdAt: new Date().toISOString(),
  status: "draft",
  object: {
    country: "Moldova",
    city: "Chișinău",
    regionId: "md-ch",
    propertyType: "apartment",
    area: 60,
    rooms: 2,
    ceilingHeight: 2.7,
    urgency: "standard",
    brandPreference: "mid",
  },
  systems: {
    floorHeating: { enabled: true, area: 25, layout: "simple", collector: true, automation: false },
    radiators: { enabled: true, count: null, roomsBased: true, scheme: "twoPipe", thermoHeads: true },
    boiler: { enabled: true, boilerType: "gas", pump: true, expansionTank: true, filters: true },
    electrical: { enabled: true, sockets: 20, switches: 10, lights: 12, panel: true },
    plumbing: { enabled: true, waterPoints: 6, sewerPoints: 4, collector: true },
  },
});

const CalcPage = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetId = searchParams.get("preset");
  const preset = useMemo(
    () => presetEstimates.find((item) => item.id === presetId),
    [presetId]
  );

  const [step, setStep] = useState(1);
  const [estimate, setEstimate] = useState<EstimateInput>(() => {
    if (preset) return { ...preset.input, id: `est-${Date.now()}` };
    const stored = localStorage.getItem("renov_draft");
    if (stored) {
      try {
        return JSON.parse(stored) as EstimateInput;
      } catch {
        return buildDefaultEstimate();
      }
    }
    return buildDefaultEstimate();
  });

  useEffect(() => {
    localStorage.setItem("renov_draft", JSON.stringify(estimate));
  }, [estimate]);

  const updateObject = (key: keyof EstimateInput["object"], value: string | number) => {
    setEstimate((prev) => ({ ...prev, object: { ...prev.object, [key]: value } }));
  };

  const updateSystems = (
    system: keyof EstimateInput["systems"],
    updates: Partial<EstimateInput["systems"][typeof system]>
  ) => {
    setEstimate((prev) => ({
      ...prev,
      systems: { ...prev.systems, [system]: { ...prev.systems[system], ...updates } },
    }));
  };

  const steps = [
    t("wizard.step.object"),
    t("wizard.step.systems"),
    t("wizard.step.review"),
    t("wizard.step.generate"),
  ];

  const handleGenerate = () => {
    const updated: EstimateInput = { ...estimate, status: "completed" };
    upsertEstimate(updated);
    navigate(`/result/${updated.id}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <AppHeader />
      <main className="mx-auto grid max-w-6xl gap-8 px-6 py-10 md:grid-cols-[240px_1fr]">
        <aside className="rounded-2xl border border-border p-6">
          <h2 className="text-base font-semibold">{t("wizard.title")}</h2>
          <ol className="mt-4 space-y-3 text-sm">
            {steps.map((label, index) => (
              <li
                key={label}
                className={`rounded-lg px-3 py-2 ${
                  step === index + 1 ? "bg-primary/10 text-primary" : "text-muted-foreground"
                }`}
              >
                {index + 1}. {label}
              </li>
            ))}
          </ol>
        </aside>
        <section className="rounded-2xl border border-border p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t("wizard.step.object")}</h2>
                <p className="text-sm text-muted-foreground">{t("calc.object.desc")}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-2 text-sm">
                  <span>{t("object.country")}</span>
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={estimate.object.country}
                    onChange={(event) => updateObject("country", event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>{t("object.city")}</span>
                  <input
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={estimate.object.city}
                    onChange={(event) => updateObject("city", event.target.value)}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>{t("object.region")}</span>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={estimate.object.regionId}
                    onChange={(event) => updateObject("regionId", event.target.value)}
                  >
                    {regions.map((region) => (
                      <option key={region.id} value={region.id}>
                        {region.country} · {region.region} ({region.coef})
                      </option>
                    ))}
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span>{t("object.type")}</span>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={estimate.object.propertyType}
                    onChange={(event) =>
                      updateObject("propertyType", event.target.value as EstimateInput["object"]["propertyType"])
                    }
                  >
                    <option value="apartment">{t("type.apartment")}</option>
                    <option value="house">{t("type.house")}</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span>{t("object.area")}</span>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={estimate.object.area}
                    onChange={(event) => updateObject("area", Number(event.target.value))}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>{t("object.rooms")}</span>
                  <input
                    type="number"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={estimate.object.rooms}
                    onChange={(event) => updateObject("rooms", Number(event.target.value))}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>{t("object.height")}</span>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={estimate.object.ceilingHeight}
                    onChange={(event) => updateObject("ceilingHeight", Number(event.target.value))}
                  />
                </label>
                <label className="space-y-2 text-sm">
                  <span>{t("object.urgency")}</span>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={estimate.object.urgency}
                    onChange={(event) =>
                      updateObject("urgency", event.target.value as EstimateInput["object"]["urgency"])
                    }
                  >
                    <option value="standard">{t("urgency.standard")}</option>
                    <option value="urgent">{t("urgency.urgent")}</option>
                  </select>
                </label>
                <label className="space-y-2 text-sm">
                  <span>{t("object.brand")}</span>
                  <select
                    className="w-full rounded-lg border border-border bg-background px-3 py-2"
                    value={estimate.object.brandPreference}
                    onChange={(event) =>
                      updateObject(
                        "brandPreference",
                        event.target.value as EstimateInput["object"]["brandPreference"]
                      )
                    }
                  >
                    <option value="budget">{t("brand.budget")}</option>
                    <option value="mid">{t("brand.mid")}</option>
                    <option value="premium">{t("brand.premium")}</option>
                    <option value="any">{t("brand.any")}</option>
                  </select>
                </label>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  onClick={() => setStep(2)}
                >
                  {t("wizard.step.systems")}
                </button>
              </div>
            </div>
          )}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t("wizard.step.systems")}</h2>
                <p className="text-sm text-muted-foreground">{t("calc.systems.desc")}</p>
              </div>
              <div className="grid gap-4">
                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{t("system.floorHeating")}</h3>
                    <input
                      type="checkbox"
                      checked={estimate.systems.floorHeating.enabled}
                      onChange={(event) =>
                        updateSystems("floorHeating", { enabled: event.target.checked })
                      }
                    />
                  </div>
                  {estimate.systems.floorHeating.enabled && (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-xs">
                        <span>{t("system.area")}</span>
                        <input
                          type="number"
                          className="w-full rounded-md border border-border bg-background px-2 py-2"
                          value={estimate.systems.floorHeating.area}
                          onChange={(event) =>
                            updateSystems("floorHeating", { area: Number(event.target.value) })
                          }
                        />
                      </label>
                      <label className="space-y-1 text-xs">
                        <span>{t("system.layout")}</span>
                        <select
                          className="w-full rounded-md border border-border bg-background px-2 py-2"
                          value={estimate.systems.floorHeating.layout}
                          onChange={(event) =>
                            updateSystems("floorHeating", {
                              layout: event.target.value as EstimateInput["systems"]["floorHeating"]["layout"],
                            })
                          }
                        >
                          <option value="simple">{t("system.simple")}</option>
                          <option value="complex">{t("system.complex")}</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={estimate.systems.floorHeating.collector}
                          onChange={(event) =>
                            updateSystems("floorHeating", { collector: event.target.checked })
                          }
                        />
                        {t("system.collector")}
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={estimate.systems.floorHeating.automation}
                          onChange={(event) =>
                            updateSystems("floorHeating", { automation: event.target.checked })
                          }
                        />
                        {t("system.automation")}
                      </label>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{t("system.radiators")}</h3>
                    <input
                      type="checkbox"
                      checked={estimate.systems.radiators.enabled}
                      onChange={(event) =>
                        updateSystems("radiators", { enabled: event.target.checked })
                      }
                    />
                  </div>
                  {estimate.systems.radiators.enabled && (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-xs">
                        <span>{t("system.count")}</span>
                        <input
                          type="number"
                          className="w-full rounded-md border border-border bg-background px-2 py-2"
                          value={estimate.systems.radiators.count ?? ""}
                          onChange={(event) =>
                            updateSystems("radiators", {
                              count: event.target.value ? Number(event.target.value) : null,
                            })
                          }
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={estimate.systems.radiators.roomsBased}
                          onChange={(event) =>
                            updateSystems("radiators", { roomsBased: event.target.checked })
                          }
                        />
                        {t("system.roomsBased")}
                      </label>
                      <label className="space-y-1 text-xs">
                        <span>{t("system.scheme")}</span>
                        <select
                          className="w-full rounded-md border border-border bg-background px-2 py-2"
                          value={estimate.systems.radiators.scheme}
                          onChange={(event) =>
                            updateSystems("radiators", {
                              scheme: event.target.value as EstimateInput["systems"]["radiators"]["scheme"],
                            })
                          }
                        >
                          <option value="singlePipe">{t("system.singlePipe")}</option>
                          <option value="twoPipe">{t("system.twoPipe")}</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={estimate.systems.radiators.thermoHeads}
                          onChange={(event) =>
                            updateSystems("radiators", { thermoHeads: event.target.checked })
                          }
                        />
                        {t("system.thermoHeads")}
                      </label>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{t("system.boiler")}</h3>
                    <input
                      type="checkbox"
                      checked={estimate.systems.boiler.enabled}
                      onChange={(event) =>
                        updateSystems("boiler", { enabled: event.target.checked })
                      }
                    />
                  </div>
                  {estimate.systems.boiler.enabled && (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-xs">
                        <span>{t("system.boilerType")}</span>
                        <select
                          className="w-full rounded-md border border-border bg-background px-2 py-2"
                          value={estimate.systems.boiler.boilerType}
                          onChange={(event) =>
                            updateSystems("boiler", {
                              boilerType: event.target.value as EstimateInput["systems"]["boiler"]["boilerType"],
                            })
                          }
                        >
                          <option value="gas">{t("system.boiler.gas")}</option>
                          <option value="solid">{t("system.boiler.solid")}</option>
                          <option value="electric">{t("system.boiler.electric")}</option>
                        </select>
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={estimate.systems.boiler.pump}
                          onChange={(event) =>
                            updateSystems("boiler", { pump: event.target.checked })
                          }
                        />
                        {t("system.pump")}
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={estimate.systems.boiler.expansionTank}
                          onChange={(event) =>
                            updateSystems("boiler", { expansionTank: event.target.checked })
                          }
                        />
                        {t("system.expansionTank")}
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={estimate.systems.boiler.filters}
                          onChange={(event) =>
                            updateSystems("boiler", { filters: event.target.checked })
                          }
                        />
                        {t("system.filters")}
                      </label>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{t("system.electrical")}</h3>
                    <input
                      type="checkbox"
                      checked={estimate.systems.electrical.enabled}
                      onChange={(event) =>
                        updateSystems("electrical", { enabled: event.target.checked })
                      }
                    />
                  </div>
                  {estimate.systems.electrical.enabled && (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-xs">
                        <span>{t("system.sockets")}</span>
                        <input
                          type="number"
                          className="w-full rounded-md border border-border bg-background px-2 py-2"
                          value={estimate.systems.electrical.sockets}
                          onChange={(event) =>
                            updateSystems("electrical", { sockets: Number(event.target.value) })
                          }
                        />
                      </label>
                      <label className="space-y-1 text-xs">
                        <span>{t("system.switches")}</span>
                        <input
                          type="number"
                          className="w-full rounded-md border border-border bg-background px-2 py-2"
                          value={estimate.systems.electrical.switches}
                          onChange={(event) =>
                            updateSystems("electrical", { switches: Number(event.target.value) })
                          }
                        />
                      </label>
                      <label className="space-y-1 text-xs">
                        <span>{t("system.lights")}</span>
                        <input
                          type="number"
                          className="w-full rounded-md border border-border bg-background px-2 py-2"
                          value={estimate.systems.electrical.lights}
                          onChange={(event) =>
                            updateSystems("electrical", { lights: Number(event.target.value) })
                          }
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={estimate.systems.electrical.panel}
                          onChange={(event) =>
                            updateSystems("electrical", { panel: event.target.checked })
                          }
                        />
                        {t("system.panel")}
                      </label>
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold">{t("system.plumbing")}</h3>
                    <input
                      type="checkbox"
                      checked={estimate.systems.plumbing.enabled}
                      onChange={(event) =>
                        updateSystems("plumbing", { enabled: event.target.checked })
                      }
                    />
                  </div>
                  {estimate.systems.plumbing.enabled && (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-xs">
                        <span>{t("system.waterPoints")}</span>
                        <input
                          type="number"
                          className="w-full rounded-md border border-border bg-background px-2 py-2"
                          value={estimate.systems.plumbing.waterPoints}
                          onChange={(event) =>
                            updateSystems("plumbing", { waterPoints: Number(event.target.value) })
                          }
                        />
                      </label>
                      <label className="space-y-1 text-xs">
                        <span>{t("system.sewerPoints")}</span>
                        <input
                          type="number"
                          className="w-full rounded-md border border-border bg-background px-2 py-2"
                          value={estimate.systems.plumbing.sewerPoints}
                          onChange={(event) =>
                            updateSystems("plumbing", { sewerPoints: Number(event.target.value) })
                          }
                        />
                      </label>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={estimate.systems.plumbing.collector}
                          onChange={(event) =>
                            updateSystems("plumbing", { collector: event.target.checked })
                          }
                        />
                        {t("system.collector")}
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-between gap-3">
                <button
                  className="rounded-lg border border-border px-4 py-2 text-sm"
                  onClick={() => setStep(1)}
                >
                  {t("wizard.step.object")}
                </button>
                <button
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  onClick={() => setStep(3)}
                >
                  {t("wizard.step.review")}
                </button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t("review.title")}</h2>
                <p className="text-sm text-muted-foreground">{t("calc.review.desc")}</p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-border p-4 text-sm">
                  <h3 className="font-semibold">{t("calc.review.object")}</h3>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    <li>{estimate.object.country}, {estimate.object.city}</li>
                    <li>{t("calc.review.area")}: {estimate.object.area} {t("unit.squareMeter")}</li>
                    <li>{t("calc.review.rooms")}: {estimate.object.rooms}</li>
                    <li>{t("calc.review.height")}: {estimate.object.ceilingHeight} {t("unit.meter")}</li>
                    <li>{t("calc.review.urgency")}: {estimate.object.urgency}</li>
                  </ul>
                </div>
                <div className="rounded-xl border border-border p-4 text-sm">
                  <h3 className="font-semibold">{t("calc.review.systems")}</h3>
                  <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                    {Object.entries(estimate.systems).map(([key, value]) => {
                      const labelMap: Record<string, string> = {
                        floorHeating: t("system.floorHeating"),
                        radiators: t("system.radiators"),
                        boiler: t("system.boiler"),
                        electrical: t("system.electrical"),
                        plumbing: t("system.plumbing"),
                      };
                      return (
                        <li key={key}>
                          {labelMap[key] ?? key}: {value.enabled ? t("calc.systems.enabled") : t("calc.systems.disabled")}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
              <div className="flex justify-between gap-3">
                <button
                  className="rounded-lg border border-border px-4 py-2 text-sm"
                  onClick={() => setStep(2)}
                >
                  {t("wizard.step.systems")}
                </button>
                <button
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  onClick={() => setStep(4)}
                >
                  {t("wizard.step.generate")}
                </button>
              </div>
            </div>
          )}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold">{t("wizard.step.generate")}</h2>
                <p className="text-sm text-muted-foreground">{t("calc.generate.desc")}</p>
              </div>
              <div className="rounded-xl border border-border p-6 text-sm">
                <p>
                  {t("calc.generate.summary")} {estimate.object.area} {t("unit.squareMeter")} · {estimate.object.city}
                </p>
              </div>
              <div className="flex justify-between gap-3">
                <button
                  className="rounded-lg border border-border px-4 py-2 text-sm"
                  onClick={() => setStep(3)}
                >
                  {t("wizard.step.review")}
                </button>
                <button
                  className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
                  onClick={handleGenerate}
                >
                  {t("cta.generate")}
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default CalcPage;
