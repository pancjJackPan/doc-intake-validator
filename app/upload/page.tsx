import { UploadForm } from "@/components/upload/upload-form";
import { demoFixtures } from "@/lib/demo/fixtures";

export default function UploadPage() {
  return (
    <section className="space-y-6">
      <div className="space-y-3">
        <p className="eyebrow">Upload Workspace</p>
        <h1 className="font-display text-5xl text-[color:var(--foreground)]">Process a new submission</h1>
        <p className="max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          This flow stores the upload record, extracts raw text, runs structured mapping, validates findings, and redirects directly into the review output.
        </p>
      </div>
      <UploadForm
        demoFixtures={demoFixtures.map((fixture) => ({
          slug: fixture.slug,
          title: fixture.title,
          description: fixture.description,
          filename: fixture.filename,
        }))}
      />
    </section>
  );
}
