import type {
  EstimateInput,
  EstimateResult,
  PackageName,
  PackageTotals,
  QuantityResult,
} from "@/lib/types";
import { checklistKeys, priceCatalog, regions, stageKeys } from "@/data/renovData";

const packageDurations: Record<PackageName, number> = {
  economy: 18,
  standard: 22,
  pro: 28,
};

const packageMultiplier: Record<PackageName, number> = {
  economy: 0.9,
  standard: 1,
  pro: 1.15,
};

const sum = (items: number[]) => items.reduce((acc, value) => acc + value, 0);

const getRegionCoef = (regionId: string) =>
  regions.find((region) => region.id === regionId)?.coef ?? 1;

const getComplexityCoef = (rooms: number, height: number) => {
  const heightCoef = height <= 2.7 ? 1 : height <= 3 ? 1.05 : 1.1;
  const roomsCoef = rooms <= 2 ? 1 : rooms <= 4 ? 1.05 : 1.1;
  return heightCoef * roomsCoef;
};

const getUrgencyCoef = (urgency: "standard" | "urgent") => (urgency === "urgent" ? 1.2 : 1);

const getSystemCount = (estimate: EstimateInput) => {
  const systems = estimate.systems;
  return [
    systems.floorHeating.enabled,
    systems.radiators.enabled,
    systems.boiler.enabled,
    systems.electrical.enabled,
    systems.plumbing.enabled,
  ].filter(Boolean).length;
};

const buildQuantities = (estimate: EstimateInput): QuantityResult[] => {
  const quantities: QuantityResult[] = [];
  const { systems, object } = estimate;

  if (systems.floorHeating.enabled) {
    const circuits = Math.ceil(systems.floorHeating.area / 12);
    const pipeTotal = systems.floorHeating.area * 5.0 * 1.12;
    const pipePerCircuit = Math.ceil(pipeTotal / circuits);
    quantities.push(
      {
        key: "floor-pipe",
        labelKey: "quantity.floor.pipe",
        qty: Math.ceil(pipeTotal),
        unitKey: "unit.meter",
        reasonKey: "quantity.floor.pipe.reason",
        workType: "floorHeating",
      },
      {
        key: "floor-circuits",
        labelKey: "quantity.floor.circuits",
        qty: circuits,
        unitKey: "unit.piece",
        reasonKey: "quantity.floor.circuits.reason",
        workType: "floorHeating",
      },
      {
        key: "floor-pipe-circuit",
        labelKey: "quantity.floor.pipePerCircuit",
        qty: pipePerCircuit,
        unitKey: "unit.meter",
        reasonKey: "quantity.floor.pipePerCircuit.reason",
        workType: "floorHeating",
      }
    );
  }

  if (systems.electrical.enabled) {
    const linesSockets = Math.ceil(systems.electrical.sockets / 10);
    const linesLights = Math.ceil(systems.electrical.lights / 12);
    const cableTotal =
      (systems.electrical.sockets + systems.electrical.switches + systems.electrical.lights) *
      8 *
      1.1;
    quantities.push(
      {
        key: "elec-lines-sockets",
        labelKey: "quantity.electrical.linesSockets",
        qty: linesSockets,
        unitKey: "unit.piece",
        reasonKey: "quantity.electrical.linesSockets.reason",
        workType: "electrical",
      },
      {
        key: "elec-lines-lights",
        labelKey: "quantity.electrical.linesLights",
        qty: linesLights,
        unitKey: "unit.piece",
        reasonKey: "quantity.electrical.linesLights.reason",
        workType: "electrical",
      },
      {
        key: "elec-cable",
        labelKey: "quantity.electrical.cable",
        qty: Math.ceil(cableTotal),
        unitKey: "unit.meter",
        reasonKey: "quantity.electrical.cable.reason",
        workType: "electrical",
      }
    );
  }

  if (systems.plumbing.enabled) {
    const pipeWater = systems.plumbing.waterPoints * 6 * 1.1;
    const fittings = Math.ceil(systems.plumbing.waterPoints * 4);
    quantities.push(
      {
        key: "plumb-pipe",
        labelKey: "quantity.plumbing.pipe",
        qty: Math.ceil(pipeWater),
        unitKey: "unit.meter",
        reasonKey: "quantity.plumbing.pipe.reason",
        workType: "plumbing",
      },
      {
        key: "plumb-fittings",
        labelKey: "quantity.plumbing.fittings",
        qty: fittings,
        unitKey: "unit.piece",
        reasonKey: "quantity.plumbing.fittings.reason",
        workType: "plumbing",
      }
    );
  }

  if (systems.radiators.enabled) {
    const radiators = systems.radiators.count ?? Math.ceil(object.rooms * 1.5);
    quantities.push({
      key: "radiators",
      labelKey: "quantity.radiators",
      qty: radiators,
      unitKey: "unit.piece",
      reasonKey: systems.radiators.count
        ? "quantity.radiators.reason.manual"
        : "quantity.radiators.reason.rooms",
      workType: "radiators",
    });
  }

  if (systems.boiler.enabled) {
    quantities.push({
      key: "boiler-kit",
      labelKey: "quantity.boiler.kit",
      qty: 1,
      unitKey: "unit.set",
      reasonKey: "quantity.boiler.kit.reason",
      workType: "boiler",
    });
  }

  return quantities;
};

const calculatePackageTotals = (
  quantities: QuantityResult[],
  packageName: PackageName,
  regionCoef: number,
  urgencyCoef: number,
  complexityCoef: number,
  complexRange: boolean
): PackageTotals => {
  const materialCost = sum(
    quantities.map((item) => {
      const price = priceCatalog.find((p) => p.workType === item.workType);
      if (!price) return 0;
      return item.qty * price.materialPrices[packageName];
    })
  );
  const laborCost = sum(
    quantities.map((item) => {
      const price = priceCatalog.find((p) => p.workType === item.workType);
      if (!price) return 0;
      return item.qty * price.laborPrices[packageName];
    })
  );

  const baseTotal = materialCost + laborCost;
  const total = baseTotal * regionCoef * urgencyCoef * complexityCoef * packageMultiplier[packageName];
  const min = total * (complexRange ? 0.88 : 0.9);
  const max = total * (complexRange ? 1.2 : 1.15);
  const durationDays = Math.round(packageDurations[packageName] * urgencyCoef);

  return {
    materialsCost: materialCost,
    laborCost,
    baseTotal,
    total,
    min,
    max,
    durationDays,
  };
};

export const buildEstimateResult = (estimate: EstimateInput): EstimateResult => {
  const quantities = buildQuantities(estimate);
  const regionCoef = getRegionCoef(estimate.object.regionId);
  const urgencyCoef = getUrgencyCoef(estimate.object.urgency);
  const complexityCoef = getComplexityCoef(estimate.object.rooms, estimate.object.ceilingHeight);
  const complexRange =
    estimate.systems.floorHeating.layout === "complex" || getSystemCount(estimate) >= 3;

  const packages = (["economy", "standard", "pro"] as PackageName[]).map((packageName) => ({
    packageName,
    totals: calculatePackageTotals(
      quantities,
      packageName,
      regionCoef,
      urgencyCoef,
      complexityCoef,
      complexRange
    ),
  }));

  const variables: Record<string, number | string | boolean> = {
    sockets: estimate.systems.electrical.sockets,
    switches: estimate.systems.electrical.switches,
    lights: estimate.systems.electrical.lights,
    panel: estimate.systems.electrical.panel,
    linesSockets: Math.ceil(estimate.systems.electrical.sockets / 10),
    linesLights: Math.ceil(estimate.systems.electrical.lights / 12),
    cableTotal: Math.ceil(
      (estimate.systems.electrical.sockets +
        estimate.systems.electrical.switches +
        estimate.systems.electrical.lights) *
        8 *
        1.1
    ),
    radiators:
      estimate.systems.radiators.count ?? Math.ceil(estimate.object.rooms * 1.5),
    scheme: estimate.systems.radiators.scheme,
    thermoHeads: estimate.systems.radiators.thermoHeads,
    boilerType: estimate.systems.boiler.boilerType,
    pump: estimate.systems.boiler.pump,
    expansionTank: estimate.systems.boiler.expansionTank,
    filters: estimate.systems.boiler.filters,
    hasRadiators: estimate.systems.radiators.enabled,
    hasFloorHeating: estimate.systems.floorHeating.enabled,
    areaM2: estimate.systems.floorHeating.area,
    circuitsCount: Math.ceil(estimate.systems.floorHeating.area / 12),
    collector: estimate.systems.floorHeating.collector,
    automation: estimate.systems.floorHeating.automation,
    pipeTotal: Math.ceil(estimate.systems.floorHeating.area * 5.0 * 1.12),
    pipePerCircuit: Math.ceil(
      (estimate.systems.floorHeating.area * 5.0 * 1.12) /
        Math.ceil(estimate.systems.floorHeating.area / 12)
    ),
    waterPoints: estimate.systems.plumbing.waterPoints,
    sewerPoints: estimate.systems.plumbing.sewerPoints,
  };

  return {
    id: estimate.id,
    createdAt: estimate.createdAt,
    object: estimate.object,
    systems: estimate.systems,
    quantities,
    packages,
    workBreakdown: quantities,
    materials: quantities,
    stages: stageKeys,
    checklist: checklistKeys,
    coefficients: {
      regionCoef,
      urgencyCoef,
      complexityCoef,
      rangeMin: complexRange ? 0.88 : 0.9,
      rangeMax: complexRange ? 1.2 : 1.15,
    },
    variables,
  };
};
