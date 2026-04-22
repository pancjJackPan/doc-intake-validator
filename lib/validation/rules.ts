import type { IssueSeverity } from "@prisma/client";

import type { StructuredDocument } from "@/lib/extraction/schema";
import { defaultHighAmountThreshold } from "@/lib/constants";
import {
  normalizeConfidence,
  normalizeOrganizationName,
  normalizePhoneNumber,
  parseDocumentDate,
} from "@/lib/validation/normalization";

export type ValidationIssueInput = {
  severity: IssueSeverity;
  code: string;
  message: string;
  suggestedFix: string;
  details?: Record<string, string | number | boolean | null>;
};

function createIssue(issue: ValidationIssueInput) {
  return issue;
}

function requiredFieldIssues(document: StructuredDocument) {
  const issues: ValidationIssueInput[] = [];
  const requiredFields: Array<[keyof StructuredDocument, string]> = [
    ["fullName", "Full name"],
    ["companyName", "Organization"],
    ["email", "Email"],
    ["documentDate", "Document date"],
    ["address", "Address"],
  ];

  for (const [field, label] of requiredFields) {
    if (!document[field]) {
      issues.push(
        createIssue({
          severity: field === "address" ? "MEDIUM" : "HIGH",
          code: `missing_${field}`,
          message: `${label} is missing from the extracted document.`,
          suggestedFix: `Request a clearer document or collect the missing ${label.toLowerCase()} before approval.`,
        }),
      );
    }
  }

  if (!document.invoiceNumber && !document.referenceNumber) {
    issues.push(
      createIssue({
        severity: "HIGH",
        code: "missing_reference",
        message: "The document does not include an invoice or reference number.",
        suggestedFix: "Request a valid invoice or case reference to anchor the review.",
      }),
    );
  }

  if (document.totalAmount == null) {
    issues.push(
      createIssue({
        severity: "MEDIUM",
        code: "amount_missing",
        message: "The document does not include a numeric total amount.",
        suggestedFix: "Ask for the billing page or corrected document with a total amount.",
      }),
    );
  }

  return issues;
}

export function validateStructuredDocument(document: StructuredDocument) {
  const issues = requiredFieldIssues(document);
  const parsedDate = parseDocumentDate(document.documentDate);

  if (document.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(document.email)) {
    issues.push(
      createIssue({
        severity: "HIGH",
        code: "invalid_email",
        message: "The extracted email address does not match a valid email format.",
        suggestedFix: "Confirm the contact email before routing the submission downstream.",
      }),
    );
  }

  if (document.phone && !normalizePhoneNumber(document.phone)) {
    issues.push(
      createIssue({
        severity: "LOW",
        code: "invalid_phone",
        message: "The phone number could not be normalized into a dialable format.",
        suggestedFix: "Verify the contact phone number if the intake requires phone outreach.",
      }),
    );
  }

  if (document.documentDate && !parsedDate) {
    issues.push(
      createIssue({
        severity: "HIGH",
        code: "invalid_date",
        message: "The document date could not be parsed into an ISO-compatible date.",
        suggestedFix: "Review the original document and correct the date field manually.",
      }),
    );
  }

  if (parsedDate && parsedDate.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
    issues.push(
      createIssue({
        severity: "HIGH",
        code: "future_date",
        message: "The document date is in the future, which is unusual for intake processing.",
        suggestedFix: "Escalate to an analyst to confirm whether the date is legitimate or a scan error.",
      }),
    );
  }

  if (
    document.referenceNumber &&
    !/^(REF|INV|PO|CASE)-?[A-Z0-9-]{3,}$/i.test(document.referenceNumber)
  ) {
    issues.push(
      createIssue({
        severity: "MEDIUM",
        code: "reference_format_mismatch",
        message: "The reference number does not match the expected internal formatting pattern.",
        suggestedFix: "Normalize the reference number or request a source document with a valid identifier.",
      }),
    );
  }

  if (typeof document.totalAmount === "number" && document.totalAmount >= defaultHighAmountThreshold) {
    issues.push(
      createIssue({
        severity: "MEDIUM",
        code: "high_amount_threshold",
        message: `The extracted amount exceeds the ${defaultHighAmountThreshold.toLocaleString()} threshold.`,
        suggestedFix: "Route the submission for manual review before approval.",
        details: { amount: document.totalAmount, threshold: defaultHighAmountThreshold },
      }),
    );
  }

  const normalizedOrganizations = Array.from(
    new Set(
      document.organizationMentions
        .map((entry) => normalizeOrganizationName(entry))
        .filter((entry): entry is string => Boolean(entry)),
    ),
  );

  if (normalizedOrganizations.length > 1) {
    issues.push(
      createIssue({
        severity: "HIGH",
        code: "organization_inconsistency",
        message: "Multiple organization names were detected across the extracted document.",
        suggestedFix: "Confirm the legal entity before processing funds or approving the intake.",
        details: {
          organizationCount: normalizedOrganizations.length,
          organizations: normalizedOrganizations.join(" | "),
        },
      }),
    );
  }

  if (normalizeConfidence(document.confidence) < 0.72) {
    issues.push(
      createIssue({
        severity: "LOW",
        code: "low_confidence_extraction",
        message: "Extraction confidence is low enough that an analyst should double-check key fields.",
        suggestedFix: "Review the raw text preview against the original file before finalizing the outcome.",
      }),
    );
  }

  return issues;
}
