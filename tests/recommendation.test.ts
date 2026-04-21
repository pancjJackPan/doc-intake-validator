import { describe, expect, it } from "vitest";

import type { StructuredDocument } from "@/lib/extraction/schema";
import { buildRecommendation } from "@/lib/validation/recommendation";
import type { ValidationIssueInput } from "@/lib/validation/rules";

const baseDocument: StructuredDocument = {
  documentType: "invoice",
  fullName: "Priya Nair",
  companyName: "Meridian Clinical Supply",
  organizationMentions: ["Meridian Clinical Supply"],
  email: "accounts@meridian-clinical.com",
  phone: "(650) 555-0199",
  documentDate: "2026-03-20",
  invoiceNumber: "INV-89012",
  referenceNumber: "CASE-77A",
  totalAmount: 27950,
  currency: "USD",
  address: "2200 Market Street, San Francisco, CA 94114",
  notes: [],
  confidence: 0.83,
};

function createIssue(overrides: Partial<ValidationIssueInput>): ValidationIssueInput {
  return {
    severity: "LOW",
    code: "low_confidence_extraction",
    message: "Low confidence extraction.",
    suggestedFix: "Review the raw text.",
    ...overrides,
  };
}

describe("recommendation generation", () => {
  it("approves clean documents", () => {
    const recommendation = buildRecommendation({ document: baseDocument, issues: [] });
    expect(recommendation.status).toBe("APPROVED");
  });

  it("routes high-risk submissions to manual review", () => {
    const recommendation = buildRecommendation({
      document: baseDocument,
      issues: [
        createIssue({
          severity: "HIGH",
          code: "organization_inconsistency",
          message: "Multiple organization names detected.",
        }),
      ],
    });

    expect(recommendation.status).toBe("NEEDS_REVIEW");
  });

  it("rejects severely incomplete submissions", () => {
    const recommendation = buildRecommendation({
      document: { ...baseDocument, fullName: null, companyName: null, email: null, address: null },
      issues: [
        createIssue({ severity: "HIGH", code: "missing_fullName" }),
        createIssue({ severity: "HIGH", code: "missing_companyName" }),
        createIssue({ severity: "HIGH", code: "missing_email" }),
        createIssue({ severity: "MEDIUM", code: "missing_address" }),
      ],
    });

    expect(recommendation.status).toBe("REJECTED");
  });
});
