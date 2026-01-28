export type ThemePreference = "light" | "dark" | "system";
export type Language = "ru" | "en" | "ro";
export type Currency = "EUR" | "USD" | "MDL" | "RON";
export type Role = "guest" | "user" | "pro" | "admin";

export type PackageName = "economy" | "standard" | "pro";

export type WorkType =
  | "electrical"
  | "radiators"
  | "boiler"
  | "floorHeating"
  | "plumbing";

export interface RegionCoef {
  id: string;
  country: string;
  region: string;
  coef: number;
}

export interface FxRate {
  currency: Currency;
  rateToEur: number;
  updatedAt: string;
}

export interface PriceItem {
  id: string;
  workType: WorkType;
  nameKey: string;
  unitKey: string;
  materialPrices: Record<PackageName, number>;
  laborPrices: Record<PackageName, number>;
}

export interface MaterialCatalogItem {
  id: string;
  workType: WorkType;
  nameKey: string;
  unitKey: string;
  analogKeys: string[];
}

export interface EstimateObjectInfo {
  country: string;
  city: string;
  regionId: string;
  propertyType: "apartment" | "house";
  area: number;
  rooms: number;
  ceilingHeight: number;
  urgency: "standard" | "urgent";
  brandPreference: "budget" | "mid" | "premium" | "any";
}

export interface FloorHeatingInput {
  enabled: boolean;
  area: number;
  layout: "simple" | "complex";
  collector: boolean;
  automation: boolean;
}

export interface RadiatorsInput {
  enabled: boolean;
  count: number | null;
  roomsBased: boolean;
  scheme: "singlePipe" | "twoPipe";
  thermoHeads: boolean;
}

export interface BoilerInput {
  enabled: boolean;
  boilerType: "gas" | "solid" | "electric";
  pump: boolean;
  expansionTank: boolean;
  filters: boolean;
}

export interface ElectricalInput {
  enabled: boolean;
  sockets: number;
  switches: number;
  lights: number;
  panel: boolean;
}

export interface PlumbingInput {
  enabled: boolean;
  waterPoints: number;
  sewerPoints: number;
  collector: boolean;
}

export interface EstimateSystemsInput {
  floorHeating: FloorHeatingInput;
  radiators: RadiatorsInput;
  boiler: BoilerInput;
  electrical: ElectricalInput;
  plumbing: PlumbingInput;
}

export interface EstimateInput {
  id: string;
  createdAt: string;
  status: "draft" | "completed";
  object: EstimateObjectInfo;
  systems: EstimateSystemsInput;
}

export interface QuantityResult {
  key: string;
  labelKey: string;
  qty: number;
  unitKey: string;
  reasonKey: string;
  workType: WorkType;
}

export interface PackageTotals {
  materialsCost: number;
  laborCost: number;
  baseTotal: number;
  total: number;
  min: number;
  max: number;
  durationDays: number;
}

export interface EstimatePackageResult {
  packageName: PackageName;
  totals: PackageTotals;
}

export interface EstimateResult {
  id: string;
  createdAt: string;
  object: EstimateObjectInfo;
  systems: EstimateSystemsInput;
  quantities: QuantityResult[];
  packages: EstimatePackageResult[];
  workBreakdown: QuantityResult[];
  materials: QuantityResult[];
  stages: string[];
  checklist: string[];
  coefficients: {
    regionCoef: number;
    urgencyCoef: number;
    complexityCoef: number;
    rangeMin: number;
    rangeMax: number;
  };
  variables: Record<string, number | string | boolean>;
}

export interface Lead {
  id: string;
  estimateId: string;
  name: string;
  contact: string;
  city: string;
  comment: string;
  createdAt: string;
  ownerUserId?: string;
}

export interface DiagramTemplate {
  id: string;
  workType: WorkType;
  nameKey: string;
  canvasW: number;
  canvasH: number;
  template: DiagramTemplateJson;
  version: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DiagramRuleCondition {
  field: string;
  operator: "==" | "!=" | ">" | "<" | ">=" | "<=" | "in";
  value: string | number | boolean | string[];
}

export interface DiagramRule {
  id: string;
  workType: WorkType;
  priority: number;
  condition: {
    all?: DiagramRuleCondition[];
    any?: DiagramRuleCondition[];
  };
  action: {
    templateId?: string;
    enableLayers?: string[];
    disableLayers?: string[];
    repeater?: Record<string, number>;
    style?: Record<string, string>;
  };
  isActive: boolean;
}

export interface DiagramTemplateJson {
  layers: {
    id: string;
    name: string;
    visible: boolean;
  }[];
  elements: DiagramElement[];
}

export interface DiagramElement {
  id: string;
  type: "rect" | "line" | "text" | "icon" | "polyline";
  x: number;
  y: number;
  w?: number;
  h?: number;
  rotation?: number;
  text?: string;
  textKey?: string;
  icon?: string;
  stroke?: string;
  strokeWidth?: number;
  fill?: string;
  points?: string;
  layerId?: string;
  bindings?: {
    text?: string;
    textKey?: string;
    visibleIf?: DiagramRuleCondition[];
    repeater?: {
      countVar: string;
      direction: "row" | "column" | "grid";
      spacing: number;
      maxVisible?: number;
    };
  };
}

export interface PresetEstimate {
  id: string;
  nameKey: string;
  descriptionKey: string;
  input: EstimateInput;
}

export interface UserProfile {
  id: string;
  name: string;
  city: string;
  role: Role;
  theme: ThemePreference;
  language: Language;
  currency: Currency;
  company?: string;
  phone?: string;
  logoUrl?: string;
  margin?: number;
  discount?: number;
}
