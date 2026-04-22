import { describe, expect, it } from "vitest";

import type { StructuredDocument } from "@/lib/extraction/schema";
import { validateStructuredDocument } from "@/lib/validation/rules";

const baseDocument: StructuredDocument = {
  documentType: "business-intake",
  fullName: "Maya Chen",
  companyName: "North Coast Logistics LLC",
  organizationMentions: ["North Coast Logistics LLC"],
  email: "maya.chen@northcoastlogistics.com",
  phone: "(415) 555-0148",
  documentDate: "2026-02-18",
  invoiceNumber: "INV-2104",
  referenceNumber: "REF-2026-1842",
  totalAmount: 4280.5,
  currency: "USD",
  address: "918 Harbor Way, Oakland, CA 94607",
  notes: [],
  confidence: 0.92,
};

describe("validation rules", () => {
  it("returns no issues for a clean document", () => {
    expect(validateStructuredDocument(baseDocument)).toHaveLength(0);
  });

  it("flags missing required fields and malformed email", () => {
    const issues = validateStructuredDocument({
      ...baseDocument,
      fullName: null,
      email: "broken-email",
      address: null,
      totalAmount: null,
      referenceNumber: null,
      invoiceNumber: null,
    });

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "missing_fullName",
        "invalid_email",
        "missing_reference",
        "amount_missing",
      ]),
    );
  });

  it("flags organization inconsistencies and high-value amounts", () => {
    const issues = validateStructuredDocument({
      ...baseDocument,
      totalAmount: 27950,
      organizationMentions: [
        "Meridian Clinical Supply",
        "Meridian Medical Supply Group",
      ],
      confidence: 0.64,
    });

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "high_amount_threshold",
        "organization_inconsistency",
        "low_confidence_extraction",
      ]),
    );
  });
});
