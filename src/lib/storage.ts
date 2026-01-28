import type { EstimateInput, Lead } from "@/lib/types";
import { presetEstimates } from "@/data/renovData";

const ESTIMATES_KEY = "renov_estimates";
const LEADS_KEY = "renov_leads";

const safeParse = <T>(value: string | null, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

export const getEstimates = (): EstimateInput[] => {
  const stored = safeParse<EstimateInput[]>(localStorage.getItem(ESTIMATES_KEY), []);
  if (stored.length) return stored;
  return presetEstimates.map((preset) => preset.input);
};

export const saveEstimates = (estimates: EstimateInput[]) => {
  localStorage.setItem(ESTIMATES_KEY, JSON.stringify(estimates));
};

export const upsertEstimate = (estimate: EstimateInput) => {
  const list = getEstimates();
  const index = list.findIndex((item) => item.id === estimate.id);
  if (index >= 0) {
    list[index] = estimate;
  } else {
    list.unshift(estimate);
  }
  saveEstimates(list);
  return estimate;
};

export const removeEstimate = (id: string) => {
  const list = getEstimates().filter((item) => item.id !== id);
  saveEstimates(list);
};

export const getLeads = (): Lead[] =>
  safeParse<Lead[]>(localStorage.getItem(LEADS_KEY), []);

export const saveLeads = (leads: Lead[]) => {
  localStorage.setItem(LEADS_KEY, JSON.stringify(leads));
};

export const addLead = (lead: Lead) => {
  const leads = getLeads();
  leads.unshift(lead);
  saveLeads(leads);
};
