import { describe, expect, it } from "vitest";

import {
  normalizeOrganizationName,
  normalizePersonName,
  normalizePhoneNumber,
  parseCurrencyAmount,
} from "@/lib/validation/normalization";

describe("normalization helpers", () => {
  it("normalizes organization names for fuzzy comparisons", () => {
    expect(normalizeOrganizationName("North Coast Logistics, LLC")).toBe("north coast logistics");
  });

  it("normalizes person names", () => {
    expect(normalizePersonName("Maya Chen, CPA")).toBe("maya chen");
  });

  it("normalizes US phone numbers", () => {
    expect(normalizePhoneNumber("(415) 555-0148")).toBe("+14155550148");
  });

  it("parses currency-like strings into numbers", () => {
    expect(parseCurrencyAmount("$4,280.50")).toBe(4280.5);
  });
});
