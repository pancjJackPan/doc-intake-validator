import Link from "next/link";

import { Panel } from "@/components/ui/panel";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <Panel className="flex min-h-60 flex-col items-start justify-center gap-4">
      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--muted)]">
        No data yet
      </p>
      <div className="space-y-2">
        <h2 className="font-display text-3xl text-[color:var(--foreground)]">{title}</h2>
        <p className="max-w-2xl text-sm leading-6 text-[color:var(--muted)]">{description}</p>
      </div>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className="button-primary">
          {actionLabel}
        </Link>
      ) : null}
    </Panel>
  );
}
