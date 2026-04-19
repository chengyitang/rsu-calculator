import { Grant, Company } from "@/types";

const GRANTS_KEY = "rsu_grants";
const CUSTOM_COMPANIES_KEY = "rsu_custom_companies";

export function loadGrants(): Grant[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(GRANTS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveGrants(grants: Grant[]): void {
  localStorage.setItem(GRANTS_KEY, JSON.stringify(grants));
}

export function loadCustomCompanies(): Company[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(CUSTOM_COMPANIES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function saveCustomCompanies(companies: Company[]): void {
  localStorage.setItem(CUSTOM_COMPANIES_KEY, JSON.stringify(companies));
}
