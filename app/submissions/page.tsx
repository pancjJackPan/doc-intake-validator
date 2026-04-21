import Link from "next/link";

import { EmptyState } from "@/components/ui/empty-state";
import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";
import { listSubmissions } from "@/lib/submissions/queries";
import { formatCurrency, formatDateTime, formatRelativeTime } from "@/lib/utils";

export default async function SubmissionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const filters = await searchParams;
  const submissions = await listSubmissions(filters);
  const query = typeof filters.query === "string" ? filters.query : "";
  const status = typeof filters.status === "string" ? filters.status : "ALL";

  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="eyebrow">Submission History</p>
        <h1 className="font-display text-5xl text-[color:var(--foreground)]">Review prior processing runs</h1>
        <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          Filter by status, search by key fields, and reopen any submission to inspect the extraction artifacts and validation decisions.
        </p>
      </div>

      <Panel>
        <form className="grid gap-4 md:grid-cols-[1fr_220px_180px]">
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Search
            </span>
            <input
              type="text"
              name="query"
              defaultValue={query}
              placeholder="Tracking code, company, contact"
              className="w-full rounded-2xl border border-black/8 bg-white/90 px-4 py-3 text-sm outline-none ring-0 transition focus:border-[color:var(--accent)]"
            />
          </label>
          <label className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
              Status
            </span>
            <select
              name="status"
              defaultValue={status}
              className="w-full rounded-2xl border border-black/8 bg-white/90 px-4 py-3 text-sm outline-none ring-0 transition focus:border-[color:var(--accent)]"
            >
              {["ALL", "UPLOADED", "PROCESSED", "NEEDS_REVIEW", "APPROVED", "REJECTED", "FAILED"].map(
                (option) => (
                  <option key={option} value={option}>
                    {option.replace(/_/g, " ")}
                  </option>
                ),
              )}
            </select>
          </label>
          <div className="flex items-end gap-3">
            <button type="submit" className="button-primary w-full justify-center">
              Apply filters
            </button>
          </div>
        </form>
      </Panel>

      {submissions.length === 0 ? (
        <EmptyState
          title="No submissions match the current filters"
          description="Upload a new document or run one of the bundled demo fixtures to populate the history table."
          actionHref="/upload"
          actionLabel="Process a document"
        />
      ) : (
        <div className="space-y-4">
          {submissions.map((submission) => (
            <Link key={submission.id} href={`/submissions/${submission.id}`}>
              <Panel className="transition hover:-translate-y-0.5 hover:bg-white/90">
                <div className="grid gap-4 lg:grid-cols-[1.1fr_0.7fr_0.7fr_0.8fr]">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge value={submission.status} />
                      <span className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                        {submission.trackingCode}
                      </span>
                    </div>
                    <h2 className="text-xl font-semibold text-[color:var(--foreground)]">
                      {submission.companyName ?? submission.fullName ?? submission.uploadedFile?.originalName}
                    </h2>
                    <p className="text-sm leading-6 text-[color:var(--muted)]">
                      {submission.summary ?? "No summary is available for this submission."}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      Contact
                    </p>
                    <p className="text-[color:var(--foreground)]">{submission.fullName ?? "Unavailable"}</p>
                    <p className="text-[color:var(--muted)]">{submission.email ?? "No email extracted"}</p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      Financials
                    </p>
                    <p className="text-[color:var(--foreground)]">{formatCurrency(submission.totalAmount)}</p>
                    <p className="text-[color:var(--muted)]">
                      {submission.validationIssues.length} finding{submission.validationIssues.length === 1 ? "" : "s"}
                    </p>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      Updated
                    </p>
                    <p className="text-[color:var(--foreground)]">{formatDateTime(submission.createdAt)}</p>
                    <p className="text-[color:var(--muted)]">{formatRelativeTime(submission.createdAt)}</p>
                  </div>
                </div>
              </Panel>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
