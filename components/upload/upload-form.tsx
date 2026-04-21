"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileText, LoaderCircle, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import type { z } from "zod";

import { uploadFormSchema } from "@/lib/submissions/schemas";
import { cn } from "@/lib/utils";

type UploadFormValues = z.infer<typeof uploadFormSchema>;

type DemoFixturePreview = {
  slug: string;
  title: string;
  description: string;
  filename: string;
};

export function UploadForm({ demoFixtures }: { demoFixtures: DemoFixturePreview[] }) {
  const router = useRouter();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeDemoId, setActiveDemoId] = useState<string | null>(null);

  const form = useForm<UploadFormValues>({
    resolver: zodResolver(uploadFormSchema),
    mode: "onSubmit",
  });

  const file = useWatch({
    control: form.control,
    name: "file",
  });
  const fileSummary = useMemo(() => {
    if (!file) {
      return null;
    }

    return `${file.name} • ${(file.size / 1024 / 1024).toFixed(2)} MB`;
  }, [file]);

  async function handleSubmission(body: BodyInit, headers?: HeadersInit) {
    const response = await fetch("/api/submissions", {
      method: "POST",
      body,
      headers,
    });

    const payload = (await response.json()) as { error?: string; redirectUrl?: string };

    if (!response.ok || !payload.redirectUrl) {
      throw new Error(payload.error ?? "Submission failed.");
    }

    router.push(payload.redirectUrl);
    router.refresh();
  }

  async function onSubmit(values: UploadFormValues) {
    setErrorMessage(null);

    try {
      const formData = new FormData();
      formData.append("file", values.file);
      await handleSubmission(formData);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Upload failed.");
    }
  }

  async function processDemoFixture(slug: string) {
    setActiveDemoId(slug);
    setErrorMessage(null);

    try {
      await handleSubmission(JSON.stringify({ demoFixtureId: slug }), {
        "Content-Type": "application/json",
      });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Demo processing failed.");
      setActiveDemoId(null);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <section className="rounded-3xl border border-black/8 bg-[color:var(--panel)] p-6 shadow-[0_20px_60px_rgba(16,24,40,0.06)]">
        <form className="space-y-6" onSubmit={form.handleSubmit(onSubmit)}>
          <div>
            <p className="eyebrow">Primary Workflow</p>
            <h2 className="panel-title">Upload a PDF or image document</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:var(--muted)]">
              Files are stored locally, processed through a local-first extraction pipeline, validated with typed rules, and turned into an actionable recommendation.
            </p>
          </div>

          <label
            className={cn(
              "flex min-h-72 cursor-pointer flex-col items-center justify-center rounded-[2rem] border border-dashed border-black/10 bg-white/70 p-8 text-center transition",
              dragActive && "border-[color:var(--accent)] bg-[color:var(--accent-soft)]",
            )}
            onDragEnter={() => setDragActive(true)}
            onDragLeave={() => setDragActive(false)}
            onDragOver={(event) => {
              event.preventDefault();
              setDragActive(true);
            }}
            onDrop={(event) => {
              event.preventDefault();
              setDragActive(false);
              const nextFile = event.dataTransfer.files?.[0];
              if (nextFile) {
                form.setValue("file", nextFile, { shouldValidate: true });
              }
            }}
          >
            <UploadCloud className="h-12 w-12 text-[color:var(--accent)]" />
            <div className="mt-5 space-y-2">
              <p className="text-lg font-semibold text-[color:var(--foreground)]">
                Drag and drop a document here
              </p>
              <p className="text-sm leading-6 text-[color:var(--muted)]">
                PDF, PNG, JPG, and JPEG are supported up to 10 MB.
              </p>
            </div>
            <span className="button-secondary mt-6">Select file</span>
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg"
              className="sr-only"
              onChange={(event) => {
                const nextFile = event.target.files?.[0];
                if (nextFile) {
                  form.setValue("file", nextFile, { shouldValidate: true });
                }
              }}
            />
          </label>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-black/6 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Selected file
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--foreground)]">
                {fileSummary ?? "No file selected yet."}
              </p>
            </div>
            <div className="rounded-2xl border border-black/6 bg-white/80 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[color:var(--muted)]">
                Processing notes
              </p>
              <p className="mt-2 text-sm leading-6 text-[color:var(--foreground)]">
                Mock extraction stays enabled by default. Add an OpenAI key to switch the structured extraction layer to live mode.
              </p>
            </div>
          </div>

          {form.formState.errors.file ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {form.formState.errors.file.message}
            </p>
          ) : null}

          {errorMessage ? (
            <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">
              {errorMessage}
            </p>
          ) : null}

          <button type="submit" className="button-primary w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <LoaderCircle className="h-4 w-4 animate-spin" />
                Processing upload
              </>
            ) : (
              <>
                <FileText className="h-4 w-4" />
                Validate document
              </>
            )}
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-black/8 bg-[color:var(--panel)] p-6 shadow-[0_20px_60px_rgba(16,24,40,0.06)]">
        <div className="space-y-2">
          <p className="eyebrow">Quick Demo</p>
          <h2 className="panel-title">Prebuilt recruiter scenarios</h2>
          <p className="text-sm leading-6 text-[color:var(--muted)]">
            Load a bundled fixture to see clean, incomplete, and suspicious outcomes without preparing your own files.
          </p>
        </div>
        <div className="mt-5 space-y-4">
          {demoFixtures.map((fixture) => {
            const isLoading = activeDemoId === fixture.slug;

            return (
              <article key={fixture.slug} className="rounded-2xl border border-black/6 bg-white/80 p-4">
                <div className="space-y-2">
                  <h3 className="text-base font-semibold text-[color:var(--foreground)]">{fixture.title}</h3>
                  <p className="text-sm leading-6 text-[color:var(--muted)]">{fixture.description}</p>
                  <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                    {fixture.filename}
                  </p>
                  <a
                    href={`/demo/${fixture.filename}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex text-xs font-medium text-[color:var(--accent)]"
                  >
                    Open bundled asset
                  </a>
                </div>
                <button
                  type="button"
                  onClick={() => void processDemoFixture(fixture.slug)}
                  className="button-secondary mt-4 w-full justify-center"
                  disabled={Boolean(activeDemoId)}
                >
                  {isLoading ? (
                    <>
                      <LoaderCircle className="h-4 w-4 animate-spin" />
                      Processing fixture
                    </>
                  ) : (
                    "Run demo fixture"
                  )}
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
