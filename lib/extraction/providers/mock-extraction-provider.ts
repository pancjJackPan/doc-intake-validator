import type { StructuredDocument } from "@/lib/extraction/schema";
import { structuredDocumentSchema } from "@/lib/extraction/schema";
import type { ExtractionProvider } from "@/lib/extraction/providers/provider";
import { normalizeConfidence, parseCurrencyAmount } from "@/lib/validation/normalization";

function getLineValue(rawText: string, labels: string[]) {
  for (const label of labels) {
    const pattern = new RegExp(`${label}\\s*[:|-]\\s*(.+)`, "i");
    const match = rawText.match(pattern);

    if (match?.[1]) {
      return match[1].trim();
    }
  }

  return null;
}

function guessDocumentType(rawText: string): StructuredDocument["documentType"] {
  const text = rawText.toLowerCase();

  if (text.includes("invoice")) {
    return "invoice";
  }

  if (text.includes("compliance")) {
    return "compliance-form";
  }

  if (text.includes("intake")) {
    return "business-intake";
  }

  return "unknown";
}

function collectOrganizationMentions(rawText: string, primaryCompanyName: string | null) {
  const mentions = new Set<string>();

  if (primaryCompanyName) {
    mentions.add(primaryCompanyName);
  }

  const labelledMentions = rawText.match(
    /(Company|Organization|Remit to|Operations Contact)\s*[:|-]\s*(.+)/gi,
  );

  for (const mention of labelledMentions ?? []) {
    const [, value = ""] = mention.split(/[:|-]/);
    if (value.trim()) {
      mentions.add(value.trim());
    }
  }

  return Array.from(mentions);
}

function heuristicExtraction(rawText: string): StructuredDocument {
  const companyName = getLineValue(rawText, [
    "Company / Organization",
    "Company",
    "Organization",
    "Remit to",
  ]);
  const totalAmount = parseCurrencyAmount(getLineValue(rawText, ["Total Amount", "Amount", "Total"]));
  const document = {
    documentType: guessDocumentType(rawText),
    fullName: getLineValue(rawText, ["Full Name", "Applicant", "Primary Contact"]),
    companyName,
    organizationMentions: collectOrganizationMentions(rawText, companyName),
    email: getLineValue(rawText, ["Email", "Contact Email"]),
    phone: getLineValue(rawText, ["Phone", "Contact Number"]),
    documentDate: getLineValue(rawText, ["Date", "Submission Date", "Document Date"]),
    invoiceNumber: getLineValue(rawText, ["Invoice Number", "Invoice"]),
    referenceNumber: getLineValue(rawText, ["Reference Number", "Reference", "Case Number"]),
    totalAmount,
    currency: totalAmount ? "USD" : null,
    address: getLineValue(rawText, ["Address", "Registered Address"]),
    notes: rawText
      .split("\n")
      .filter((line) => line.toLowerCase().startsWith("notes"))
      .map((line) => line.replace(/^notes\s*[:|-]\s*/i, "").trim()),
    confidence: normalizeConfidence(
      totalAmount && companyName ? 0.86 : rawText.length > 250 ? 0.74 : 0.58,
    ),
  } satisfies StructuredDocument;

  return structuredDocumentSchema.parse(document);
}

export class MockExtractionProvider implements ExtractionProvider {
  readonly kind = "MOCK" as const;

  async extractStructuredDocument(input: {
    rawText: string;
    fileName: string;
    mimeType: string;
  }) {
    return {
      provider: this.kind,
      modelName: undefined,
      document: heuristicExtraction(input.rawText),
      notes: [
        "Structured extraction was produced by the local heuristic provider.",
        "Switch EXTRACTION_PROVIDER=openai with credentials to enable live structured extraction.",
      ],
    };
  }
}
