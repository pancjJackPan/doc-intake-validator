import Link from "next/link";
import { notFound } from "next/navigation";

import { SubmissionReview } from "@/components/dashboard/submission-review";
import { getSubmissionById } from "@/lib/submissions/queries";

export default async function ResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    notFound();
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="eyebrow">Processing complete</p>
          <h1 className="font-display text-4xl text-[color:var(--foreground)]">
            Submission ready for review
          </h1>
        </div>
        <div className="flex gap-3">
          <Link href="/upload" className="button-secondary">
            Review another file
          </Link>
          <Link href="/submissions" className="button-secondary">
            Open history
          </Link>
        </div>
      </div>
      <SubmissionReview submission={submission} mode="results" />
    </section>
  );
}
