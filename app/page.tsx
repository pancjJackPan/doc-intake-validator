import Link from "next/link";
import { ArrowRight, CheckCircle2, Database, FileSearch, ShieldAlert } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { getDashboardStats } from "@/lib/submissions/queries";

const pillars = [
  {
    title: "Local-first file processing",
    description:
      "PDF text extraction works locally, while image handling uses a pluggable OCR adapter with a safe mock fallback.",
    icon: FileSearch,
  },
  {
    title: "Typed extraction pipeline",
    description:
      "Structured fields are mapped into a validated schema so downstream logic always works with known types.",
    icon: Database,
  },
  {
    title: "Actionable review output",
    description:
      "Every submission returns severity-tagged findings, confidence notes, and a recommendation that an ops analyst can act on immediately.",
    icon: ShieldAlert,
  },
];

export default async function Home() {
  const stats = await getDashboardStats();

  return (
    <>
      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <Panel className="overflow-hidden p-0">
          <div className="grid gap-8 px-8 py-10 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="space-y-6">
              <p className="eyebrow">Portfolio-grade internal operations tooling</p>
              <div className="space-y-4">
                <h1 className="max-w-3xl font-display text-5xl leading-tight text-[color:var(--foreground)] md:text-6xl">
                  Upload documents, structure the data, and route the next action.
                </h1>
                <p className="max-w-2xl text-base leading-8 text-[color:var(--muted)]">
                  Doc Intake Validator demonstrates strong fit for full-stack roles that combine Next.js, TypeScript, file handling, API integrations, typed business logic, and recruiter-ready presentation quality.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <Link href="/upload" className="button-primary">
                  Start a review
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/submissions" className="button-secondary">
                  Browse submission history
                </Link>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="stat-card bg-[color:var(--foreground)] text-white">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">
                  What this app shows
                </p>
                <p className="mt-3 text-lg leading-7 text-white">
                  Clean architecture, upload workflows, Prisma persistence, pluggable extraction, rules engines, and operationally useful UI.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="stat-card">
                  <p className="stat-label">Stored submissions</p>
                  <p className="stat-value text-3xl">{stats.totalSubmissions}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Needs review</p>
                  <p className="stat-value text-3xl">{stats.needsReview}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Approved</p>
                  <p className="stat-value text-3xl">{stats.approved}</p>
                </div>
                <div className="stat-card">
                  <p className="stat-label">Rejected</p>
                  <p className="stat-value text-3xl">{stats.rejected}</p>
                </div>
              </div>
            </div>
          </div>
        </Panel>
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        {pillars.map((pillar) => {
          const Icon = pillar.icon;
          return (
            <Panel key={pillar.title} className="space-y-4">
              <span className="inline-flex rounded-2xl bg-[color:var(--accent-soft)] p-3 text-[color:var(--accent)]">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-xl font-semibold text-[color:var(--foreground)]">{pillar.title}</h2>
                <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{pillar.description}</p>
              </div>
            </Panel>
          );
        })}
      </section>

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel className="space-y-4">
          <p className="eyebrow">Workflow</p>
          <h2 className="panel-title">What a recruiter can verify in under two minutes</h2>
          <div className="space-y-4">
            {[
              "Upload a PDF or image and persist the metadata plus processing run.",
              "Extract text locally, then convert it into typed fields via a pluggable provider.",
              "Run rule-based validation with severity, issue codes, and suggested fixes.",
              "Review history, export JSON, and inspect the timeline for audit visibility.",
            ].map((step) => (
              <div key={step} className="flex gap-3 rounded-2xl border border-black/6 bg-white/80 p-4">
                <CheckCircle2 className="mt-0.5 h-5 w-5 text-[color:var(--accent)]" />
                <p className="text-sm leading-7 text-[color:var(--foreground)]">{step}</p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="space-y-5">
          <div>
            <p className="eyebrow">Screenshots-ready UI</p>
            <h2 className="panel-title">Built like a real internal review console</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[2rem] border border-black/6 bg-white/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Result surfaces
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
                File summary panels, raw text previews, structured JSON, validation findings, and a recommended action block.
              </p>
            </div>
            <div className="rounded-[2rem] border border-black/6 bg-white/80 p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
                Operational clarity
              </p>
              <p className="mt-3 text-sm leading-7 text-[color:var(--foreground)]">
                Status badges, history filters, audit-friendly timeline entries, and exportable JSON outputs.
              </p>
            </div>
          </div>
        </Panel>
      </section>
    </>
  );
}
