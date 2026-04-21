import Link from "next/link";

import { IssueList } from "@/components/dashboard/issue-list";
import { StructuredFieldsTable } from "@/components/dashboard/structured-fields-table";
import { TimelineList } from "@/components/dashboard/timeline-list";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { formatBytes, formatCurrency, formatDateTime } from "@/lib/utils";

type SubmissionRecord = {
  id: string;
  trackingCode: string;
  status: string;
  source: string;
  documentType: string | null;
  fullName: string | null;
  companyName: string | null;
  email: string | null;
  referenceNumber: string | null;
  totalAmount: number | null;
  confidenceScore: number | null;
  recommendedAction: string | null;
  summary: string | null;
  createdAt: Date;
  uploadedFile: {
    originalName: string;
    mimeType: string;
    extension: string;
    sizeBytes: number;
  } | null;
  extractedDocument: {
    rawText: string;
    structuredData: unknown;
    notes: string | null;
  } | null;
  validationIssues: Array<{
    id: string;
    severity: string;
    code: string;
    message: string;
    suggestedFix: string | null;
  }>;
  processingRuns: Array<{
    status: string;
    recommendedAction: string | null;
    timeline: unknown;
  }>;
};

function getTimelineEntries(timeline: unknown) {
  if (!Array.isArray(timeline)) {
    return [];
  }

  return timeline.filter(
    (
      entry,
    ): entry is {
      label: string;
      status: "complete" | "warning" | "error";
      timestamp: string;
      detail: string;
    } => {
      if (!entry || typeof entry !== "object") {
        return false;
      }

      const candidate = entry as Record<string, unknown>;

      return (
        typeof candidate.label === "string" &&
        typeof candidate.status === "string" &&
        typeof candidate.timestamp === "string" &&
        typeof candidate.detail === "string"
      );
    },
  );
}

export function SubmissionReview({
  submission,
  mode,
}: {
  submission: SubmissionRecord;
  mode: "results" | "detail";
}) {
  const structuredData =
    submission.extractedDocument?.structuredData &&
    typeof submission.extractedDocument.structuredData === "object" &&
    !Array.isArray(submission.extractedDocument.structuredData)
      ? (submission.extractedDocument.structuredData as Record<string, unknown>)
      : {};
  const timeline = getTimelineEntries(submission.processingRuns[0]?.timeline);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.45fr_0.95fr]">
      <div className="space-y-6">
        <Panel className="space-y-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="eyebrow">{mode === "results" ? "Processing Result" : "Submission Detail"}</p>
              <h1 className="font-display text-4xl text-[color:var(--foreground)]">
                {submission.companyName ?? submission.fullName ?? "Untitled submission"}
              </h1>
              <p className="max-w-3xl text-sm leading-6 text-[color:var(--muted)]">
                {submission.summary ?? "The submission is ready for operational review."}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge value={submission.status} />
              <a href={`/api/submissions/${submission.id}/export`} className="button-secondary">
                Export JSON
              </a>
              {mode === "results" ? (
                <Link href={`/submissions/${submission.id}`} className="button-secondary">
                  View detail
                </Link>
              ) : null}
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="stat-card">
              <p className="stat-label">Tracking code</p>
              <p className="stat-value text-lg">{submission.trackingCode}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Confidence</p>
              <p className="stat-value text-lg">
                {submission.confidenceScore != null
                  ? `${Math.round(submission.confidenceScore * 100)}%`
                  : "N/A"}
              </p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Validation issues</p>
              <p className="stat-value text-lg">{submission.validationIssues.length}</p>
            </div>
            <div className="stat-card">
              <p className="stat-label">Created</p>
              <p className="stat-value text-base">{formatDateTime(submission.createdAt)}</p>
            </div>
          </div>
        </Panel>

        <Panel className="space-y-4">
          <div>
            <p className="eyebrow">File Summary</p>
            <h2 className="panel-title">Source metadata</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-black/6 bg-white/80 p-4">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">Original file</dt>
                  <dd className="font-medium text-[color:var(--foreground)]">
                    {submission.uploadedFile?.originalName ?? "Unavailable"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">MIME type</dt>
                  <dd className="font-medium text-[color:var(--foreground)]">
                    {submission.uploadedFile?.mimeType ?? "Unavailable"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">Size</dt>
                  <dd className="font-medium text-[color:var(--foreground)]">
                    {submission.uploadedFile
                      ? formatBytes(submission.uploadedFile.sizeBytes)
                      : "Unavailable"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">Source</dt>
                  <dd className="font-medium text-[color:var(--foreground)]">
                    {submission.source.toLowerCase()}
                  </dd>
                </div>
              </dl>
            </div>
            <div className="rounded-2xl border border-black/6 bg-white/80 p-4">
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">Document type</dt>
                  <dd className="font-medium text-[color:var(--foreground)]">
                    {submission.documentType ?? "Unknown"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">Primary contact</dt>
                  <dd className="font-medium text-[color:var(--foreground)]">
                    {submission.fullName ?? "Unavailable"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">Reference</dt>
                  <dd className="font-medium text-[color:var(--foreground)]">
                    {submission.referenceNumber ?? "Missing"}
                  </dd>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <dt className="text-[color:var(--muted)]">Amount</dt>
                  <dd className="font-medium text-[color:var(--foreground)]">
                    {formatCurrency(submission.totalAmount)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </Panel>

        <Panel className="space-y-4">
          <div>
            <p className="eyebrow">Raw Text Preview</p>
            <h2 className="panel-title">Local extraction transcript</h2>
          </div>
          <pre className="max-h-[26rem] overflow-auto rounded-2xl border border-black/6 bg-black/[0.03] p-4 text-sm leading-7 text-[color:var(--foreground)]">
            {submission.extractedDocument?.rawText ?? "No extracted text is available for this submission."}
          </pre>
        </Panel>

        <StructuredFieldsTable structuredData={structuredData} />
      </div>

      <div className="space-y-6">
        <Panel className="space-y-4">
          <div>
            <p className="eyebrow">Recommended Action</p>
            <h2 className="panel-title">{submission.recommendedAction ?? "Awaiting review outcome"}</h2>
          </div>
          <div className="rounded-2xl border border-black/6 bg-white/80 p-4 text-sm leading-6 text-[color:var(--muted)]">
            {submission.summary ??
              "Use the validation findings and extracted fields to determine the final operational disposition."}
          </div>
          {submission.extractedDocument?.notes ? (
            <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-900">
              <p className="mb-1 text-xs font-semibold uppercase tracking-[0.2em]">Confidence & notes</p>
              <p>{submission.extractedDocument.notes}</p>
            </div>
          ) : null}
        </Panel>

        <IssueList issues={submission.validationIssues} />
        <TimelineList entries={timeline} />
      </div>
    </div>
  );
}
