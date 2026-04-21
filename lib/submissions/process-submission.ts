import { readFile } from "node:fs/promises";
import path from "node:path";

import type { Prisma } from "@prisma/client";

import { getDemoFixture, getDemoFixtureAssetPath } from "@/lib/demo/fixtures";
import { createExtractionProvider } from "@/lib/extraction/provider-factory";
import { extractRawTextFromStoredFile } from "@/lib/extraction/raw-text";
import type { StructuredDocument } from "@/lib/extraction/schema";
import { prisma } from "@/lib/prisma";
import { demoSubmissionSchema, uploadRequestSchema } from "@/lib/submissions/schemas";
import { persistUploadFile } from "@/lib/storage";
import { titleCase } from "@/lib/utils";
import { normalizeOrganizationName, normalizePersonName } from "@/lib/validation/normalization";
import { buildRecommendation } from "@/lib/validation/recommendation";
import { validateStructuredDocument } from "@/lib/validation/rules";

type TimelineEntry = {
  label: string;
  status: "complete" | "warning" | "error";
  timestamp: string;
  detail: string;
};

function createTrackingCode() {
  const stamp = new Date().toISOString().slice(2, 10).replace(/-/g, "");
  const token = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `SUB-${stamp}-${token}`;
}

function buildSummary(documentType: string | null, issueCount: number, recommendationLabel: string) {
  const label = documentType ? titleCase(documentType) : "Document";
  return `${label} processed with ${issueCount} validation ${issueCount === 1 ? "issue" : "issues"} and recommendation: ${recommendationLabel}.`;
}

function serializeIssueDetails(details?: Prisma.InputJsonValue) {
  return details ?? undefined;
}

async function finalizeSubmission(input: {
  submissionId: string;
  processingRunId: string;
  providerKind: "MOCK" | "OPENAI";
  modelName?: string;
  startedAt: Date;
  rawText: string;
  extractionNotes: string[];
  extractionConfidence: number;
  document: StructuredDocument;
}) {
  const issues = validateStructuredDocument(input.document);
  const recommendation = buildRecommendation({ document: input.document, issues });
  const finishedAt = new Date();
  const combinedConfidence = Number(
    ((input.document.confidence + input.extractionConfidence) / 2).toFixed(2),
  );

  const timeline: TimelineEntry[] = [
    {
      label: "Upload stored",
      status: "complete",
      timestamp: finishedAt.toISOString(),
      detail: "File metadata and storage path were recorded in SQLite.",
    },
    {
      label: "Text extracted",
      status: "complete",
      timestamp: finishedAt.toISOString(),
      detail: `${input.rawText.length.toLocaleString()} characters extracted from the source file.`,
    },
    {
      label: "Structured fields mapped",
      status: "complete",
      timestamp: finishedAt.toISOString(),
      detail: `${input.providerKind} provider mapped the transcript into typed fields.`,
    },
    {
      label: "Validation completed",
      status: issues.length > 0 ? "warning" : "complete",
      timestamp: finishedAt.toISOString(),
      detail: `${issues.length} findings were produced by the rules engine.`,
    },
    {
      label: "Recommendation generated",
      status: recommendation.status === "APPROVED" ? "complete" : "warning",
      timestamp: finishedAt.toISOString(),
      detail: recommendation.label,
    },
  ];

  await prisma.$transaction([
    prisma.extractedDocument.upsert({
      where: { submissionId: input.submissionId },
      create: {
        submissionId: input.submissionId,
        provider: input.providerKind,
        rawText: input.rawText,
        structuredData: input.document as Prisma.InputJsonValue,
        confidenceScore: combinedConfidence,
        normalizedName: normalizePersonName(input.document.fullName),
        normalizedCompany: normalizeOrganizationName(input.document.companyName),
        notes: [...input.extractionNotes, ...input.document.notes].filter(Boolean).join("\n"),
      },
      update: {
        provider: input.providerKind,
        rawText: input.rawText,
        structuredData: input.document as Prisma.InputJsonValue,
        confidenceScore: combinedConfidence,
        normalizedName: normalizePersonName(input.document.fullName),
        normalizedCompany: normalizeOrganizationName(input.document.companyName),
        notes: [...input.extractionNotes, ...input.document.notes].filter(Boolean).join("\n"),
      },
    }),
    prisma.validationIssue.deleteMany({
      where: { submissionId: input.submissionId },
    }),
    prisma.validationIssue.createMany({
      data: issues.map((issue) => ({
        submissionId: input.submissionId,
        severity: issue.severity,
        code: issue.code,
        message: issue.message,
        suggestedFix: issue.suggestedFix,
        details: serializeIssueDetails(issue.details as Prisma.InputJsonValue | undefined),
      })),
    }),
    prisma.processingRun.update({
      where: { id: input.processingRunId },
      data: {
        status: "SUCCEEDED",
        modelName: input.modelName,
        sourceTextLength: input.rawText.length,
        notes: [...input.extractionNotes, ...input.document.notes].filter(Boolean).join("\n"),
        recommendedAction: recommendation.label,
        timeline: timeline as Prisma.InputJsonValue,
        completedAt: finishedAt,
        durationMs: finishedAt.getTime() - input.startedAt.getTime(),
      },
    }),
    prisma.submission.update({
      where: { id: input.submissionId },
      data: {
        status: recommendation.status,
        documentType: input.document.documentType,
        fullName: input.document.fullName,
        companyName: input.document.companyName,
        email: input.document.email,
        referenceNumber: input.document.referenceNumber ?? input.document.invoiceNumber,
        totalAmount: input.document.totalAmount ?? undefined,
        confidenceScore: combinedConfidence,
        recommendedAction: recommendation.label,
        summary: buildSummary(input.document.documentType, issues.length, recommendation.label),
      },
    }),
  ]);

  return {
    issueCount: issues.length,
    recommendation,
  };
}

export async function processUploadedDocument(input: {
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  buffer: Buffer;
  source: "UPLOAD" | "DEMO" | "SEED";
}) {
  uploadRequestSchema.parse({
    originalName: input.originalName,
    mimeType: input.mimeType,
    sizeBytes: input.sizeBytes,
  });

  const submission = await prisma.submission.create({
    data: {
      trackingCode: createTrackingCode(),
      source: input.source,
      status: "UPLOADED",
    },
  });

  const storedFile = await persistUploadFile({
    submissionId: submission.id,
    originalName: input.originalName,
    buffer: input.buffer,
  });

  await prisma.uploadedFile.create({
    data: {
      submissionId: submission.id,
      originalName: input.originalName,
      mimeType: input.mimeType,
      extension: storedFile.extension,
      sizeBytes: input.sizeBytes,
      storagePath: storedFile.storagePath,
    },
  });

  const provider = createExtractionProvider();
  const runStartedAt = new Date();
  const processingRun = await prisma.processingRun.create({
    data: {
      submissionId: submission.id,
      status: "RUNNING",
      provider: provider.kind,
      startedAt: runStartedAt,
      timeline: [
        {
          label: "Upload accepted",
          status: "complete",
          timestamp: runStartedAt.toISOString(),
          detail: `${input.originalName} stored locally for processing.`,
        },
      ] as Prisma.InputJsonValue,
    },
  });

  try {
    const rawTextResult = await extractRawTextFromStoredFile({
      filePath: storedFile.storagePath,
      originalName: input.originalName,
      mimeType: input.mimeType,
    });

    const extraction = await provider.extractStructuredDocument({
      rawText: rawTextResult.text,
      fileName: input.originalName,
      mimeType: input.mimeType,
    });

    await finalizeSubmission({
      submissionId: submission.id,
      processingRunId: processingRun.id,
      providerKind: extraction.provider,
      modelName: extraction.modelName,
      startedAt: runStartedAt,
      rawText: rawTextResult.text,
      extractionNotes: [...rawTextResult.notes, ...extraction.notes],
      extractionConfidence: rawTextResult.confidence,
      document: {
        ...extraction.document,
        confidence: extraction.document.confidence,
      },
    });

    return {
      submissionId: submission.id,
    };
  } catch (error) {
    await prisma.$transaction([
      prisma.processingRun.update({
        where: { id: processingRun.id },
        data: {
          status: "FAILED",
          errorMessage: error instanceof Error ? error.message : "Unknown processing failure.",
          completedAt: new Date(),
        },
      }),
      prisma.submission.update({
        where: { id: submission.id },
        data: {
          status: "FAILED",
          summary: "The submission failed during extraction or validation.",
        },
      }),
    ]);

    throw error;
  }
}

export async function processDemoFixture(demoFixtureId: string, source: "DEMO" | "SEED" = "DEMO") {
  const fixtureInput = demoSubmissionSchema.parse({ demoFixtureId });
  const fixture = getDemoFixture(fixtureInput.demoFixtureId);

  if (!fixture) {
    throw new Error(`Unknown demo fixture: ${demoFixtureId}`);
  }

  const assetPath = getDemoFixtureAssetPath(fixture.filename);
  const buffer = await readFile(assetPath);

  return processUploadedDocument({
    originalName: fixture.filename,
    mimeType: fixture.mimeType,
    sizeBytes: buffer.byteLength,
    buffer,
    source,
  });
}

export async function readDemoFixtureBuffer(filename: string) {
  const assetPath = getDemoFixtureAssetPath(path.basename(filename));
  return readFile(assetPath);
}
