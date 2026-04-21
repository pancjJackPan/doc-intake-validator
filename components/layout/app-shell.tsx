import type { ReactNode } from "react";

import Link from "next/link";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-screen">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.12),transparent_26%),radial-gradient(circle_at_top_right,rgba(20,184,166,0.16),transparent_28%),linear-gradient(to_bottom,rgba(255,255,255,0.3),transparent_40%)]" />
      <header className="relative z-10 border-b border-black/6 bg-white/70 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <Link href="/" className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[color:var(--muted)]">
              Ops Review
            </p>
            <p className="font-display text-2xl text-[color:var(--foreground)]">
              Doc Intake Validator
            </p>
          </Link>
          <nav className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
            <Link href="/upload" className="nav-link">
              Upload
            </Link>
            <Link href="/submissions" className="nav-link">
              History
            </Link>
          </nav>
        </div>
      </header>
      <main className="relative z-10 mx-auto flex max-w-7xl flex-col gap-8 px-6 py-10">{children}</main>
    </div>
  );
}
