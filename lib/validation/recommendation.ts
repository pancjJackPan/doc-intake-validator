import type { SubmissionStatus } from "@prisma/client";

import type { StructuredDocument } from "@/lib/extraction/schema";
import type { ValidationIssueInput } from "@/lib/validation/rules";

export type Recommendation = {
  status: SubmissionStatus;
  label: string;
  rationale: string;
  nextAction: string;
};

export function buildRecommendation(input: {
  document: StructuredDocument;
  issues: ValidationIssueInput[];
}): Recommendation {
  const counts = input.issues.reduce(
    (accumulator, issue) => {
      accumulator[issue.severity] += 1;
      return accumulator;
    },
    { LOW: 0, MEDIUM: 0, HIGH: 0, CRITICAL: 0 },
  );

  const missingHighPriorityFields = input.issues.filter((issue) =>
    issue.code.startsWith("missing_"),
  ).length;

  if (counts.CRITICAL > 0 || missingHighPriorityFields >= 4) {
    return {
      status: "REJECTED",
      label: "Reject and request a corrected document",
      rationale:
        "The submission is too incomplete to move forward safely without a resubmission.",
      nextAction:
        "Request a replacement document with the missing contact, date, and reference fields included.",
    };
  }

  if (
    counts.HIGH > 0 ||
    counts.MEDIUM >= 2 ||
    input.issues.some((issue) => issue.code === "organization_inconsistency")
  ) {
    return {
      status: "NEEDS_REVIEW",
      label: "Escalate to manual review",
      rationale:
        "The document contains material inconsistencies or risk flags that warrant analyst confirmation.",
      nextAction:
        "Send the case to an operations reviewer with the extracted fields and raw text side-by-side.",
    };
  }

  if (counts.MEDIUM === 1 || counts.LOW >= 2 || input.document.confidence < 0.8) {
    return {
      status: "PROCESSED",
      label: "Processed with follow-up notes",
      rationale:
        "The submission is structurally usable, but it still contains non-blocking warnings worth tracking.",
      nextAction:
        "Continue processing while logging the warnings for downstream audit visibility.",
    };
  }

  return {
    status: "APPROVED",
    label: "Approve for downstream processing",
    rationale: "The extracted record is complete, internally consistent, and low risk.",
    nextAction: "Move the submission into the approved queue and archive the extraction result.",
  };
}
