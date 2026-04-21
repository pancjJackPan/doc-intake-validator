import { AlertTriangle } from "lucide-react";

import { Panel } from "@/components/ui/panel";
import { StatusBadge } from "@/components/ui/status-badge";

type IssueLike = {
  id: string;
  severity: string;
  code: string;
  message: string;
  suggestedFix: string | null;
};

export function IssueList({ issues }: { issues: IssueLike[] }) {
  return (
    <Panel className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Validation Findings</p>
          <h2 className="panel-title">Rule-based review output</h2>
        </div>
        <StatusBadge value={issues.length ? "NEEDS_REVIEW" : "APPROVED"} />
      </div>
      {issues.length === 0 ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          No validation issues were produced. The extracted fields look internally consistent.
        </div>
      ) : (
        <div className="space-y-3">
          {issues.map((issue) => (
            <article key={issue.id} className="rounded-2xl border border-black/6 bg-white/80 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-3">
                  <span className="mt-1 rounded-full bg-amber-100 p-2 text-amber-900">
                    <AlertTriangle className="h-4 w-4" />
                  </span>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-[color:var(--foreground)]">{issue.message}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
                      {issue.code.replace(/_/g, " ")}
                    </p>
                  </div>
                </div>
                <StatusBadge value={issue.severity} />
              </div>
              {issue.suggestedFix ? (
                <p className="mt-3 text-sm leading-6 text-[color:var(--muted)]">
                  Suggested action: {issue.suggestedFix}
                </p>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </Panel>
  );
}
