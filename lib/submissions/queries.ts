import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { historyFiltersSchema } from "@/lib/submissions/schemas";

const submissionInclude = {
  uploadedFile: true,
  extractedDocument: true,
  validationIssues: {
    orderBy: [{ severity: "desc" }, { createdAt: "asc" }],
  },
  processingRuns: {
    orderBy: {
      createdAt: "desc",
    },
  },
} satisfies Prisma.SubmissionInclude;

export async function getDashboardStats() {
  const [totalSubmissions, needsReview, approved, rejected] = await Promise.all([
    prisma.submission.count(),
    prisma.submission.count({ where: { status: "NEEDS_REVIEW" } }),
    prisma.submission.count({ where: { status: "APPROVED" } }),
    prisma.submission.count({ where: { status: "REJECTED" } }),
  ]);

  return {
    totalSubmissions,
    needsReview,
    approved,
    rejected,
  };
}

export async function getSubmissionById(id: string) {
  return prisma.submission.findUnique({
    where: { id },
    include: submissionInclude,
  });
}

export async function listSubmissions(filters: Record<string, string | string[] | undefined>) {
  const parsed = historyFiltersSchema.parse({
    status: typeof filters.status === "string" ? filters.status : "ALL",
    query: typeof filters.query === "string" ? filters.query : "",
  });

  const query = parsed.query.trim();
  const where: Prisma.SubmissionWhereInput = {
    ...(parsed.status !== "ALL" ? { status: parsed.status } : {}),
    ...(query
      ? {
          OR: [
            { trackingCode: { contains: query } },
            { fullName: { contains: query } },
            { companyName: { contains: query } },
            { referenceNumber: { contains: query } },
          ],
        }
      : {}),
  };

  return prisma.submission.findMany({
    where,
    orderBy: {
      createdAt: "desc",
    },
    include: {
      uploadedFile: true,
      validationIssues: true,
      processingRuns: {
        orderBy: {
          createdAt: "desc",
        },
        take: 1,
      },
    },
  });
}
