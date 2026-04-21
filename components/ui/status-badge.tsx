import { cn } from "@/lib/utils";

const toneMap: Record<string, string> = {
  UPLOADED: "bg-slate-200 text-slate-800",
  PROCESSED: "bg-amber-100 text-amber-900",
  NEEDS_REVIEW: "bg-orange-100 text-orange-900",
  APPROVED: "bg-emerald-100 text-emerald-900",
  REJECTED: "bg-rose-100 text-rose-900",
  FAILED: "bg-red-100 text-red-900",
  RUNNING: "bg-sky-100 text-sky-900",
  SUCCEEDED: "bg-emerald-100 text-emerald-900",
  PENDING: "bg-slate-200 text-slate-800",
  LOW: "bg-slate-200 text-slate-800",
  MEDIUM: "bg-amber-100 text-amber-900",
  HIGH: "bg-orange-100 text-orange-900",
  CRITICAL: "bg-rose-100 text-rose-900",
};

export function StatusBadge({
  value,
  className,
}: {
  value: string;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em]",
        toneMap[value] ?? "bg-slate-200 text-slate-800",
        className,
      )}
    >
      {value.replace(/_/g, " ").toLowerCase()}
    </span>
  );
}
