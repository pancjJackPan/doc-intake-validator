import { Panel } from "@/components/ui/panel";
import { formatDateTime } from "@/lib/utils";

type TimelineEntry = {
  label: string;
  status: "complete" | "warning" | "error";
  timestamp: string;
  detail: string;
};

const dotStyles: Record<TimelineEntry["status"], string> = {
  complete: "bg-emerald-500",
  warning: "bg-amber-500",
  error: "bg-rose-500",
};

export function TimelineList({ entries }: { entries: TimelineEntry[] }) {
  return (
    <Panel className="space-y-4">
      <div>
        <p className="eyebrow">Processing Timeline</p>
        <h2 className="panel-title">Audit-friendly event trail</h2>
      </div>
      <ol className="space-y-4">
        {entries.map((entry) => (
          <li key={`${entry.label}-${entry.timestamp}`} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span className={`mt-2 h-2.5 w-2.5 rounded-full ${dotStyles[entry.status]}`} />
              <span className="mt-2 h-full w-px bg-black/8" />
            </div>
            <div className="pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-[color:var(--foreground)]">{entry.label}</p>
                <span className="text-xs text-[color:var(--muted)]">{formatDateTime(entry.timestamp)}</span>
              </div>
              <p className="mt-1 text-sm leading-6 text-[color:var(--muted)]">{entry.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </Panel>
  );
}
