"use client";

import { ReactNode, useState } from "react";

/* ---------- Section panel with a sticky-ish blueprint header ---------- */
export function Section({
  id,
  index,
  title,
  count,
  children,
  defaultOpen = true,
}: {
  id: string;
  index: string;
  title: string;
  count?: number | string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <section id={id} className="scroll-mt-24">
      <button
        onClick={() => setOpen((o) => !o)}
        className="group flex w-full items-center gap-4 border-b border-hairline py-4 text-left transition-colors hover:border-hairline-bright"
      >
        <span className="font-mono text-xs text-cyan tabular-nums">{index}</span>
        <h2 className="flex-1 text-lg font-semibold tracking-tight text-fg">
          {title}
        </h2>
        {count !== undefined && (
          <span className="rounded-full border border-hairline bg-ink-2 px-2.5 py-0.5 font-mono text-xs text-fg-muted">
            {count}
          </span>
        )}
        <span
          className={`font-mono text-fg-dim transition-transform duration-300 ${
            open ? "rotate-90" : ""
          }`}
        >
          ▸
        </span>
      </button>
      <div
        className={`overflow-hidden transition-all ${
          open ? "mt-6" : "max-h-0"
        }`}
        hidden={!open}
      >
        {children}
      </div>
    </section>
  );
}

/* ---------- Status / meta pill ---------- */
export function Pill({
  children,
  tone = "dim",
}: {
  children: ReactNode;
  tone?: "green" | "amber" | "rose" | "cyan" | "dim";
}) {
  const tones: Record<string, string> = {
    green: "border-green/40 text-green bg-green/5",
    amber: "border-amber/40 text-amber bg-amber/5",
    rose: "border-rose/40 text-rose bg-rose/5",
    cyan: "border-cyan/40 text-cyan-bright bg-cyan/5",
    dim: "border-hairline text-fg-muted bg-ink-2",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-xs ${tones[tone]}`}
    >
      {tone !== "dim" && (
        <span
          className="h-1.5 w-1.5 rounded-full bg-current"
          style={{ animation: "pulse-dot 2s ease-in-out infinite" }}
        />
      )}
      {children}
    </span>
  );
}

/* ---------- Labelled key/value field ---------- */
export function Field({
  label,
  children,
  mono = false,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
}) {
  return (
    <div className="min-w-0">
      <div className="label mb-1">{label}</div>
      <div
        className={`break-words text-sm text-fg ${mono ? "font-mono" : ""}`}
      >
        {children}
      </div>
    </div>
  );
}

/* ---------- Copyable inline code ---------- */
export function CopyChip({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1200);
        });
      }}
      title="Copy"
      className="inline-flex items-center gap-2 rounded-md border border-hairline bg-ink-2 px-2 py-1 font-mono text-xs text-fg-muted transition-colors hover:border-cyan/50 hover:text-cyan-bright"
    >
      <span className="truncate">{value}</span>
      <span className="text-fg-dim">{copied ? "✓" : "⧉"}</span>
    </button>
  );
}
