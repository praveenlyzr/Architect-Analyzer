"use client";

import type { BuildMetrics as Metrics } from "@/lib/metrics";
import { humanDuration } from "@/lib/metrics";

function Big({
  value,
  label,
  hint,
}: {
  value: string | number;
  label: string;
  hint?: string;
}) {
  return (
    <div className="rounded-2xl border border-hairline bg-gradient-to-b from-ink-2/80 to-ink-2/30 p-5">
      <div className="font-mono text-3xl font-semibold tabular-nums text-cyan-bright">
        {value}
      </div>
      <div className="label mt-2">{label}</div>
      {hint && <div className="mt-1 text-xs text-fg-dim">{hint}</div>}
    </div>
  );
}

function Mini({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-xl border border-hairline bg-panel/40 p-4">
      <div className="font-mono text-xl font-semibold tabular-nums text-fg">
        {value}
      </div>
      <div className="label mt-1">{label}</div>
    </div>
  );
}

const BAR_COLORS: Record<string, string> = {
  Status: "bg-fg-dim",
  Write: "bg-green",
  Read: "bg-cyan",
  Agent: "bg-amber",
  Architect: "bg-amber",
  Tasks: "bg-cyan-bright",
  Commit: "bg-green",
  Workflow: "bg-amber",
  User: "bg-cyan-bright",
};

export function BuildMetrics({ m }: { m: Metrics }) {
  const maxCount = Math.max(...m.eventHistogram.map((e) => e.count), 1);

  return (
    <div className="space-y-6">
      {/* Headline judging metrics */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Big
          value={m.userMessages}
          label="User Messages"
          hint={`${m.humanPromptWords.toLocaleString()} words of human input`}
        />
        <Big
          value={m.agentActions}
          label="Agent Actions"
          hint={`of ${m.buildEvents} total build events`}
        />
        <Big
          value={humanDuration(m.buildDurationMs)}
          label="Build Time"
          hint="initial autonomous build session"
        />
        <Big
          value={m.filesWritten}
          label="Files Written"
          hint={`${m.commits} commit${m.commits === 1 ? "" : "s"}`}
        />
      </div>

      {/* Build efficiency callout */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-cyan/25 bg-cyan/5 px-5 py-4">
        <div>
          <div className="label text-cyan">Autonomous Build Efficiency</div>
          <div className="mt-1 text-sm text-fg-muted">
            {m.userMessages} human message{m.userMessages === 1 ? "" : "s"} →{" "}
            {m.agentActions} agent action{m.agentActions === 1 ? "" : "s"} ·{" "}
            {m.filesWritten} file{m.filesWritten === 1 ? "" : "s"} ·{" "}
            {m.commits} commit{m.commits === 1 ? "" : "s"} · across{" "}
            {m.sessions} work session{m.sessions === 1 ? "" : "s"}
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-2xl font-semibold text-cyan-bright">
            {m.userMessages
              ? (m.agentActions / m.userMessages).toFixed(1)
              : "—"}
            ×
          </div>
          <div className="label">actions per human msg</div>
        </div>
      </div>

      {/* Secondary metrics */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        <Mini value={m.totalMessages} label="Total Messages" />
        <Mini value={m.clarifyingQuestions} label="Clarifying Q's" />
        <Mini value={m.toolInvocations} label="Tool Calls" />
        <Mini value={m.filesRead} label="Files Read" />
        <Mini value={m.agentsCreated} label="Agents Built" />
        <Mini
          value={`${m.workflowNodes}/${m.workflowEdges}`}
          label="WF Nodes/Edges"
        />
        <Mini value={m.prdWords.toLocaleString()} label="PRD Words" />
        <Mini value={humanDuration(m.totalSpanMs)} label="Project Span" />
      </div>

      {/* Event distribution histogram */}
      {m.eventHistogram.length > 0 && (
        <div className="rounded-2xl border border-hairline bg-panel/40 p-5">
          <div className="label mb-4">Build Activity Breakdown</div>
          <div className="space-y-2.5">
            {m.eventHistogram.map((e) => (
              <div key={e.type} className="flex items-center gap-3">
                <div className="w-28 shrink-0 truncate text-right font-mono text-xs text-fg-muted">
                  {e.type}
                </div>
                <div className="h-5 flex-1 overflow-hidden rounded bg-ink-2">
                  <div
                    className={`h-full rounded ${
                      BAR_COLORS[e.type] ?? "bg-hairline-bright"
                    }`}
                    style={{ width: `${(e.count / maxCount) * 100}%` }}
                  />
                </div>
                <div className="w-8 shrink-0 font-mono text-xs tabular-nums text-fg">
                  {e.count}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {m.models.length > 0 && (
        <div className="text-xs text-fg-dim">
          <span className="label">Models used: </span>
          <span className="font-mono text-cyan/80">{m.models.join(", ")}</span>
        </div>
      )}
    </div>
  );
}
