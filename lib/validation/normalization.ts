import { parseISO } from "date-fns";

import { clamp } from "@/lib/utils";

export function normalizeWhitespace(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() ?? "";
}

export function normalizeOrganizationName(value: string | null | undefined) {
  const normalized = normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[.,]/g, "")
    .replace(/\b(inc|llc|ltd|corp|corporation|company|co|group)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || null;
}

export function normalizePersonName(value: string | null | undefined) {
  const normalized = normalizeWhitespace(value)
    .toLowerCase()
    .replace(/[^a-z\s'-]/g, "")
    .replace(/\b(cpa|esq|mba|phd|md)\b/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return normalized || null;
}

export function normalizePhoneNumber(value: string | null | undefined) {
  const digits = (value ?? "").replace(/\D/g, "");

  if (!digits) {
    return null;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }

  return digits.length >= 10 ? `+${digits}` : null;
}

export function parseCurrencyAmount(value: string | number | null | undefined) {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  const candidate = normalizeWhitespace(value);
  if (!candidate) {
    return null;
  }

  const parsed = Number(candidate.replace(/[^0-9.-]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

export function parseDocumentDate(value: string | null | undefined) {
  const candidate = normalizeWhitespace(value);

  if (!candidate) {
    return null;
  }

  const parsed = parseISO(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function normalizeConfidence(value: number | null | undefined) {
  return clamp(typeof value === "number" ? value : 0, 0, 1);
}
