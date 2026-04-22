import { Panel } from "@/components/ui/panel";
import { titleCase } from "@/lib/utils";

function renderValue(value: unknown) {
  if (value == null || value === "") {
    return <span className="text-[color:var(--muted)]">Missing</span>;
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "[]";
  }

  if (typeof value === "number") {
    return value.toLocaleString();
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

export function StructuredFieldsTable({
  structuredData,
}: {
  structuredData: Record<string, unknown>;
}) {
  return (
    <Panel className="space-y-4">
      <div>
        <p className="eyebrow">Structured Fields</p>
        <h2 className="panel-title">Typed extraction output</h2>
      </div>
      <div className="overflow-hidden rounded-2xl border border-black/6 bg-white/80">
        <table className="w-full border-collapse text-sm">
          <tbody>
            {Object.entries(structuredData).map(([key, value]) => (
              <tr key={key} className="border-b border-black/6 last:border-b-0">
                <th className="w-48 bg-black/[0.03] px-4 py-3 text-left font-medium text-[color:var(--muted)]">
                  {titleCase(key)}
                </th>
                <td className="px-4 py-3 text-[color:var(--foreground)]">{renderValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="rounded-2xl border border-black/6 bg-black/[0.03] p-4">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-[color:var(--muted)]">
          JSON payload
        </p>
        <pre className="overflow-x-auto text-xs leading-6 text-[color:var(--foreground)]">
          {JSON.stringify(structuredData, null, 2)}
        </pre>
      </div>
    </Panel>
  );
}
