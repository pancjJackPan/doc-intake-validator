import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-3xl border border-black/8 bg-[color:var(--panel)] p-5 shadow-[0_20px_60px_rgba(16,24,40,0.06)] backdrop-blur-sm",
        className,
      )}
    >
      {children}
    </section>
  );
}
